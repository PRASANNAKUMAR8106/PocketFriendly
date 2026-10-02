-- ====================================================================
-- POCKETFRIENDLY SAREES - FIRST ADMINISTRATOR SETUP (MIGRATION 007)
-- ====================================================================
-- 
-- INSTRUCTIONS TO SETUP YOUR FIRST ADMINISTRATOR:
-- 
-- STEP 1: Create the User in Supabase Dashboard
-- 1. Go to your Supabase Project: https://supabase.com/dashboard
-- 2. In the left navigation, click on "Authentication" -> "Users"
-- 3. Click the "Add User" button -> "Create user"
-- 4. Enter your administrator email (e.g., admin@pocketfriendlysarees.com)
-- 5. Enter a secure administrator password
-- 6. Ensure "Auto Confirm User" is CHECKED (so no verification email is required)
-- 7. Click "Create user"
-- 
-- STEP 2: Run This Bootstrap SQL Script
-- 1. Open the "SQL Editor" in your Supabase Dashboard
-- 2. Paste and run the command below, replacing the email with your admin email:
-- 
--    SELECT public.bootstrap_first_admin('admin@pocketfriendlysarees.com');
-- 
-- ====================================================================

-- 1. Idempotent Bootstrap Function
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
    NULL;
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

-- Grant execution to authenticated & service_role
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(TEXT) TO postgres, service_role;

-- ====================================================================
-- VERIFICATION QUERY: Run this to confirm your admin is active:
-- ====================================================================
-- SELECT id, email, full_name, role, created_at 
-- FROM public.profiles 
-- WHERE role IN ('admin', 'super_admin', 'manager');
