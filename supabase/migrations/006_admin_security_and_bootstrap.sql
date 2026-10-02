-- ====================================================================
-- POCKETFRIENDLY SAREES - ADMIN SECURITY HARDENING & BOOTSTRAP (MIGRATION 006)
-- ====================================================================

-- 1. HARDEN USER REGISTRATION: NEVER TRUST CLIENT-SUPPLIED ROLE
-- A customer cannot pass { role: 'admin' } in signup metadata to elevate privileges.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer' -- STRICT: Every public signup is ALWAYS a customer.
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. HARDEN PROFILES: PREVENT PRIVILEGE ESCALATION VIA CLIENT UPDATE
-- A customer cannot send UPDATE profiles SET role = 'admin' WHERE id = auth.uid()
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed:
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow if the executing user is already an admin/super_admin or service_role
    IF NOT public.is_admin() AND current_user NOT IN ('postgres', 'service_role') THEN
      RAISE EXCEPTION 'Privilege escalation denied: You do not have permission to modify administrative roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trigger_prevent_role_escalation
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 3. REVISE PROFILE UPDATE RLS POLICY
-- Normal users can only update their own non-sensitive profile columns
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Users cannot change their own role to admin through RLS
  (role = 'customer' OR public.is_admin())
);

-- 4. HARDEN AUDIT LOGS RLS
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (public.is_admin());

-- 5. HARDEN ORDER STATUS UPDATES
-- Only administrators may change order fulfillment and payment status
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" 
ON public.orders FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. SECURE FIRST-ADMINISTRATOR BOOTSTRAP PROCEDURE
-- This provides a safe, documented server-side method to promote the first administrator.
-- It CANNOT be abused once an administrator exists.
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_admin_count INTEGER;
  v_target_user_id UUID;
BEGIN
  -- Check if any administrator currently exists
  SELECT COUNT(*) INTO v_admin_count 
  FROM public.profiles 
  WHERE role IN ('admin', 'super_admin');

  -- If an administrator already exists, require caller to be an admin
  IF v_admin_count > 0 AND NOT public.is_admin() AND current_user NOT IN ('postgres', 'service_role') THEN
    RAISE EXCEPTION 'Bootstrap denied: An administrator is already provisioned for this store. Access must be granted by an existing administrator.';
  END IF;

  -- Find target profile by email
  SELECT id INTO v_target_user_id 
  FROM public.profiles 
  WHERE LOWER(email) = LOWER(TRIM(p_email));

  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist in profiles. User must register via Supabase Auth first.', p_email;
  END IF;

  -- Promote user to admin
  UPDATE public.profiles 
  SET role = 'admin', updated_at = NOW() 
  WHERE id = v_target_user_id;

  -- Log security event
  INSERT INTO public.audit_logs (action, entity_type, entity_id, details)
  VALUES (
    'ADMIN_BOOTSTRAP',
    'PROFILE',
    v_target_user_id::text,
    jsonb_build_object('promoted_email', p_email, 'promoted_by', current_user)
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User successfully promoted to Administrator.',
    'email', p_email,
    'user_id', v_target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
