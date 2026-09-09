-- ==============================================================================
-- UniBridge Complete Database Foundation & Existing Users Backfill
-- Run this complete script in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/imkwtekrtdhixamhoyto/sql/new
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_category AS ENUM (
    'hostel',
    'academic',
    'infrastructure',
    'cafeteria',
    'sports',
    'transport',
    'library',
    'it_services',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  description text,
  head_faculty_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. PROFILES TABLE (Linked 1:1 with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  student_id_number text,
  phone text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Circular reference: add foreign key to departments.head_faculty_id if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_head_faculty'
  ) THEN
    ALTER TABLE public.departments 
      ADD CONSTRAINT fk_head_faculty 
      FOREIGN KEY (head_faculty_id) 
      REFERENCES public.profiles(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. AUTO-GENERATE TICKET NUMBER SEQUENCE
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS complaint_ticket_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_complaint_ticket()
RETURNS text AS $$
DECLARE
  curr_year text;
  next_val integer;
BEGIN
  curr_year := to_char(current_date, 'YYYY');
  next_val := nextval('complaint_ticket_seq');
  RETURN 'UB-' || curr_year || '-' || lpad(next_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 5. COMPLAINTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL DEFAULT generate_complaint_ticket(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category complaint_category NOT NULL DEFAULT 'other',
  location text NOT NULL,
  building_room text,
  is_anonymous boolean NOT NULL DEFAULT false,
  status complaint_status NOT NULL DEFAULT 'submitted',
  priority complaint_priority NOT NULL DEFAULT 'medium',
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  assigned_faculty_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  attachments text[] DEFAULT '{}',
  ai_predicted_category text,
  ai_predicted_priority text,
  ai_summary text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- ------------------------------------------------------------------------------
-- 6. COMPLAINT TIMELINE / AUDIT TRAIL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  old_value text,
  new_value text,
  remarks text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. COMPLAINT COMMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. CAMPUS EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  organizer text NOT NULL,
  location text NOT NULL,
  event_date timestamptz NOT NULL,
  category text NOT NULL DEFAULT 'General',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system',
  related_complaint_id uuid REFERENCES public.complaints(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_department_id ON public.complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_faculty ON public.complaints(assigned_faculty_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_complaint_id ON public.complaint_timeline(complaint_id);
CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON public.complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 11. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ------------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT coalesce(public.get_current_role() = 'admin', false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS boolean AS $$
  SELECT coalesce(public.get_current_role() = 'faculty', false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- DEPARTMENTS POLICIES (Accessible to authenticated users and anonymous visitors on register)
DROP POLICY IF EXISTS "Departments viewable by authenticated users" ON public.departments;
DROP POLICY IF EXISTS "Departments viewable by everyone" ON public.departments;
CREATE POLICY "Departments viewable by everyone"
  ON public.departments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.is_admin());

-- COMPLAINTS POLICIES
DROP POLICY IF EXISTS "Students can submit complaints" ON public.complaints;
CREATE POLICY "Students can submit complaints"
  ON public.complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Complaints read policy" ON public.complaints;
CREATE POLICY "Complaints read policy"
  ON public.complaints FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR (
      public.is_faculty() AND (
        assigned_faculty_id = auth.uid() 
        OR department_id IN (SELECT department_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update complaints" ON public.complaints;
CREATE POLICY "Admins can update complaints"
  ON public.complaints FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Faculty can update assigned complaints" ON public.complaints;
CREATE POLICY "Faculty can update assigned complaints"
  ON public.complaints FOR UPDATE
  TO authenticated
  USING (
    public.is_faculty() AND (
      assigned_faculty_id = auth.uid() 
      OR department_id IN (SELECT department_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- COMPLAINT TIMELINE POLICIES
DROP POLICY IF EXISTS "Timeline viewable by complaint stakeholders" ON public.complaint_timeline;
CREATE POLICY "Timeline viewable by complaint stakeholders"
  ON public.complaint_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_timeline.complaint_id
      AND (c.student_id = auth.uid() OR public.is_admin() OR public.is_faculty())
    )
  );

DROP POLICY IF EXISTS "Stakeholders can insert timeline logs" ON public.complaint_timeline;
CREATE POLICY "Stakeholders can insert timeline logs"
  ON public.complaint_timeline FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_id OR public.is_admin());

-- COMPLAINT COMMENTS POLICIES
DROP POLICY IF EXISTS "Comments viewable by stakeholders (internal filtered for students)" ON public.complaint_comments;
CREATE POLICY "Comments viewable by stakeholders (internal filtered for students)"
  ON public.complaint_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_comments.complaint_id
      AND (
        public.is_admin() OR public.is_faculty()
        OR (c.student_id = auth.uid() AND NOT complaint_comments.is_internal)
      )
    )
  );

DROP POLICY IF EXISTS "Stakeholders can insert comments" ON public.complaint_comments;
CREATE POLICY "Stakeholders can insert comments"
  ON public.complaint_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (
      (public.get_current_role() = 'student' AND NOT is_internal)
      OR public.is_faculty()
      OR public.is_admin()
    )
  );

-- CAMPUS EVENTS POLICIES
DROP POLICY IF EXISTS "Campus events viewable by all authenticated users" ON public.campus_events;
DROP POLICY IF EXISTS "Campus events viewable by everyone" ON public.campus_events;
CREATE POLICY "Campus events viewable by everyone"
  ON public.campus_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Faculty and admins can create campus events" ON public.campus_events;
CREATE POLICY "Faculty and admins can create campus events"
  ON public.campus_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_faculty() OR public.is_admin());

DROP POLICY IF EXISTS "Faculty and admins can manage campus events" ON public.campus_events;
CREATE POLICY "Faculty and admins can manage campus events"
  ON public.campus_events FOR UPDATE
  TO authenticated
  USING (public.is_faculty() OR public.is_admin());

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their own notifications as read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 13. SEED 10 ACADEMIC DEPARTMENTS & SAMPLE CAMPUS EVENTS
-- ------------------------------------------------------------------------------
INSERT INTO public.departments (name, code, description)
VALUES
  ('Computer Science and Engineering (CSE)', 'CSE', 'Department of Computer Science and Engineering. Programming, Algorithms, Systems, and Software.'),
  ('Information Technology (IT)', 'IT', 'Department of Information Technology. Networks, Cloud Computing, Databases, and Information Systems.'),
  ('Electronics and Communication Engineering (ECE)', 'ECE', 'Department of Electronics and Communication. VLSI, Embedded Systems, Signal Processing, and Telecommunications.'),
  ('Electrical and Electronics Engineering (EEE)', 'EEE', 'Department of Electrical and Electronics Engineering. Power Systems, Control Engineering, and Renewable Energy.'),
  ('Mechanical Engineering (ME)', 'ME', 'Department of Mechanical Engineering. Thermodynamics, Robotics, CAD/CAM, and Manufacturing.'),
  ('Civil Engineering (CE)', 'CE', 'Department of Civil Engineering. Structural Engineering, Geotechnical, and Environmental Infrastructure.'),
  ('Artificial Intelligence and Data Science (AI & DS)', 'AI_DS', 'Department of AI and Data Science. Machine Learning, Deep Learning, Big Data Analytics, and NLP.'),
  ('Mathematics', 'MATH', 'Department of Mathematics. Applied Calculus, Linear Algebra, Statistics, and Discrete Mathematics.'),
  ('Physics', 'PHYS', 'Department of Physics. Applied Physics, Quantum Mechanics, Optics, and Materials Science.'),
  ('English', 'ENG', 'Department of English & Humanities. Technical Communication, Professional Ethics, and Literature.')
ON CONFLICT (name) DO UPDATE SET
  code = EXCLUDED.code,
  description = EXCLUDED.description;

-- Idempotent Campus Events insertion (avoids duplicates without needing unique constraints)
INSERT INTO public.campus_events (title, description, organizer, location, event_date, category)
SELECT 
  'Annual Campus Hackathon 2026', 
  'Join 300+ students across engineering and design for 24 hours of innovation and building solutions for student life.', 
  'UniBridge Tech Club', 
  'Central Innovation Hub, Hall B', 
  now() + interval '5 days', 
  'Technology'
WHERE NOT EXISTS (SELECT 1 FROM public.campus_events WHERE title = 'Annual Campus Hackathon 2026');

INSERT INTO public.campus_events (title, description, organizer, location, event_date, category)
SELECT 
  'Campus Town Hall & Feedback Forum', 
  'Open dialogue with the Dean of Student Affairs and Department Heads regarding campus renovations and new dining facilities.', 
  'Student Council', 
  'Main Auditorium', 
  now() + interval '12 days', 
  'Governance'
WHERE NOT EXISTS (SELECT 1 FROM public.campus_events WHERE title = 'Campus Town Hall & Feedback Forum');

INSERT INTO public.campus_events (title, description, organizer, location, event_date, category)
SELECT 
  'Inter-Collegiate Badminton & Basketball Championship', 
  'Annual sports tournament featuring 16 universities. Come cheer for the home team!', 
  'Department of Physical Education', 
  'Indoor Sports Complex', 
  now() + interval '18 days', 
  'Sports'
WHERE NOT EXISTS (SELECT 1 FROM public.campus_events WHERE title = 'Inter-Collegiate Badminton & Basketball Championship');

-- ------------------------------------------------------------------------------
-- 14. BACKFILL PROFILES FOR EXISTING USERS IN auth.users
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 15. STORAGE BUCKET SETUP (For Complaint Attachments)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-attachments',
  'complaint-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'complaint-attachments');

DROP POLICY IF EXISTS "Attachments viewable by authenticated users" ON storage.objects;
CREATE POLICY "Attachments viewable by authenticated users"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'complaint-attachments');

DROP POLICY IF EXISTS "Users can delete their own uploaded attachments" ON storage.objects;
CREATE POLICY "Users can delete their own uploaded attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'complaint-attachments' AND auth.uid() = owner);
