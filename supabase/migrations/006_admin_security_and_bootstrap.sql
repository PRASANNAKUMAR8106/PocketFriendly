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

-- Allow users to insert their own initial profile if the trigger did not run
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id AND role = 'customer');

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
-- It checks auth.users first, creates the profile if missing, and assigns the admin role.
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_admin_count INTEGER;
  v_auth_id UUID;
  v_auth_email TEXT;
  v_auth_meta JSONB;
BEGIN
  -- 1. Check if an administrator already exists
  SELECT COUNT(*) INTO v_admin_count 
  FROM public.profiles 
  WHERE role IN ('admin', 'super_admin');

  -- If an administrator already exists, require caller to be an admin or postgres/service_role
  IF v_admin_count > 0 AND NOT public.is_admin() AND current_user NOT IN ('postgres', 'service_role') THEN
    RAISE EXCEPTION 'Bootstrap denied: An administrator is already provisioned for this store. Additional administrators must be invited by an existing administrator.';
  END IF;

  -- 2. Verify that the user exists in Supabase Authentication (auth.users)
  SELECT id, email, raw_user_meta_data 
  INTO v_auth_id, v_auth_email, v_auth_meta
  FROM auth.users 
  WHERE LOWER(email) = LOWER(TRIM(p_email));

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'User "%" not found in auth.users. Please create this user under Supabase Dashboard -> Authentication -> Users first.', p_email;
  END IF;

  -- 3. Upsert profile with admin role
  INSERT INTO public.profiles (id, email, full_name, role, updated_at)
  VALUES (
    v_auth_id,
    v_auth_email,
    COALESCE(v_auth_meta->>'full_name', split_part(v_auth_email, '@', 1)),
    'admin',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      email = EXCLUDED.email,
      updated_at = NOW();

  -- 4. Log security event (safely)
  BEGIN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, details)
    VALUES (
      'ADMIN_BOOTSTRAP',
      'PROFILE',
      v_auth_id::text,
      jsonb_build_object('promoted_email', p_email, 'promoted_by', current_user)
    );
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Avoid breaking if audit_logs table has not been created yet
  END;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User successfully provisioned as Administrator.',
    'email', v_auth_email,
    'user_id', v_auth_id,
    'role', 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

