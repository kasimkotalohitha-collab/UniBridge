-- ==============================================================================
-- UniBridge: Fix public.handle_new_user() & on_auth_user_created Trigger
-- 
-- Run this script in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/imkwtekrtdhixamhoyto/sql/new
--
-- FIXES:
-- 1. Sets "SET search_path = public, pg_temp" so "user_role" type resolves
--    under the GoTrue auth worker session (fixing "type user_role does not exist").
-- 2. Removes invalid schema-qualification "public.profiles.column" inside 
--    ON CONFLICT (id) DO UPDATE SET (fixing "missing FROM-clause entry for table public").
-- 3. Safely validates department_id format (UUID regex) and verifies existence
--    in public.departments before casting to uuid (preventing invalid UUID syntax
--    and foreign key constraint violations).
-- 4. Safely validates role ('student', 'faculty', 'admin') with a fallback to 'student'.
-- 5. Wraps profile insertion in an EXCEPTION handler to ensure unexpected errors
--    never block auth user creation.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role public.user_role := 'student'::public.user_role;
  v_raw_role text;
  v_full_name text;
  v_phone text;
  v_student_id text;
  v_raw_dept text;
  v_dept_id uuid := NULL;
BEGIN
  -- 1. Safely resolve full_name with sensible fallback to email prefix
  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');
  IF v_full_name IS NULL THEN
    v_full_name := coalesce(split_part(new.email, '@', 1), 'Campus Member');
  END IF;

  -- 2. Safely resolve role (must be one of 'student', 'faculty', 'admin')
  v_raw_role := lower(trim(coalesce(new.raw_user_meta_data->>'role', 'student')));
  IF v_raw_role IN ('student', 'faculty', 'admin') THEN
    v_role := v_raw_role::public.user_role;
  ELSE
    v_role := 'student'::public.user_role;
  END IF;

  -- 3. Safely resolve optional string metadata (empty strings converted to NULL)
  v_student_id := nullif(trim(coalesce(new.raw_user_meta_data->>'student_id_number', '')), '');
  v_phone := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');

  -- 4. Safely resolve department_id:
  --    Must match UUID regex format AND exist in public.departments to avoid FK constraint violation
  v_raw_dept := trim(coalesce(new.raw_user_meta_data->>'department_id', ''));
  IF v_raw_dept ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    SELECT id INTO v_dept_id
    FROM public.departments
    WHERE id = v_raw_dept::uuid;
  END IF;

  -- 5. Safe upsert into public.profiles
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      student_id_number,
      phone,
      department_id,
      created_at,
      updated_at
    ) VALUES (
      new.id,
      new.email,
      v_full_name,
      v_role,
      v_student_id,
      v_phone,
      v_dept_id,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = coalesce(EXCLUDED.full_name, profiles.full_name),
      role = coalesce(EXCLUDED.role, profiles.role),
      student_id_number = coalesce(EXCLUDED.student_id_number, profiles.student_id_number),
      phone = coalesce(EXCLUDED.phone, profiles.phone),
      department_id = coalesce(EXCLUDED.department_id, profiles.department_id),
      updated_at = now();
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error details to PostgreSQL log without aborting the auth signup transaction
      RAISE WARNING 'handle_new_user: Failed to insert/update profile for user %: % (SQLSTATE: %)',
        new.id, SQLERRM, SQLSTATE;
  END;

  RETURN new;
END;
$$;

-- Ensure trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for any existing users in auth.users who lack a profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  student_id_number,
  phone,
  department_id
)
SELECT
  u.id,
  u.email,
  COALESCE(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    split_part(u.email, '@', 1)
  ),
  CASE 
    WHEN lower(trim(coalesce(u.raw_user_meta_data->>'role', ''))) IN ('student', 'faculty', 'admin')
    THEN (lower(trim(u.raw_user_meta_data->>'role')))::public.user_role
    ELSE 'student'::public.user_role
  END,
  nullif(trim(u.raw_user_meta_data->>'student_id_number'), ''),
  nullif(trim(u.raw_user_meta_data->>'phone'), ''),
  d.id
FROM auth.users u
LEFT JOIN public.departments d 
  ON (u.raw_user_meta_data->>'department_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND d.id = (u.raw_user_meta_data->>'department_id')::uuid
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = coalesce(EXCLUDED.full_name, profiles.full_name),
  role = coalesce(EXCLUDED.role, profiles.role),
  student_id_number = coalesce(EXCLUDED.student_id_number, profiles.student_id_number),
  phone = coalesce(EXCLUDED.phone, profiles.phone),
  department_id = coalesce(EXCLUDED.department_id, profiles.department_id),
  updated_at = now();
