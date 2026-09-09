-- ==============================================================================
-- Migration 004: Class Queries & Automated Complaint/Query Notifications
-- ==============================================================================

-- 1. CLASS QUERIES TABLE
CREATE TABLE IF NOT EXISTS public.class_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  subject text NOT NULL,
  course_code text,
  room text,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'academic',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  faculty_response text,
  responded_at timestamptz,
  attachments text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_queries_student_id ON public.class_queries(student_id);
CREATE INDEX IF NOT EXISTS idx_class_queries_faculty_id ON public.class_queries(faculty_id);
CREATE INDEX IF NOT EXISTS idx_class_queries_status ON public.class_queries(status);
CREATE INDEX IF NOT EXISTS idx_class_queries_created_at ON public.class_queries(created_at DESC);

-- Enable RLS
ALTER TABLE public.class_queries ENABLE ROW LEVEL SECURITY;

-- Class Queries RLS Policies
DROP POLICY IF EXISTS "Students can insert their own queries" ON public.class_queries;
CREATE POLICY "Students can insert their own queries"
  ON public.class_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view their own queries" ON public.class_queries;
CREATE POLICY "Students can view their own queries"
  ON public.class_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Faculty can view queries directed to them" ON public.class_queries;
CREATE POLICY "Faculty can view queries directed to them"
  ON public.class_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = faculty_id);

DROP POLICY IF EXISTS "Faculty can update queries directed to them" ON public.class_queries;
CREATE POLICY "Faculty can update queries directed to them"
  ON public.class_queries FOR UPDATE
  TO authenticated
  USING (auth.uid() = faculty_id);

-- Admins: VIEW-ONLY access (Cannot insert or update)
DROP POLICY IF EXISTS "Admins can view all queries" ON public.class_queries;
CREATE POLICY "Admins can view all queries"
  ON public.class_queries FOR SELECT
  TO authenticated
  USING (coalesce(public.get_current_role() = 'admin', false));

-- ------------------------------------------------------------------------------
-- 2. AUTOMATED COMPLAINT NOTIFICATIONS TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_complaint_notification()
RETURNS trigger AS $$
DECLARE
  v_status_label text;
BEGIN
  -- A. Faculty Assignment Notification
  IF NEW.assigned_faculty_id IS NOT NULL AND 
     (OLD.assigned_faculty_id IS NULL OR NEW.assigned_faculty_id <> OLD.assigned_faculty_id) THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_complaint_id
    ) VALUES (
      NEW.assigned_faculty_id,
      'New Complaint Assigned',
      'You have been assigned a new complaint: ' || NEW.title || ' (' || NEW.ticket_number || ')',
      'assignment',
      NEW.id
    );
  END IF;

  -- B. Complaint Status Change Notification to Student
  IF NEW.status <> OLD.status AND NEW.student_id IS NOT NULL THEN
    CASE NEW.status
      WHEN 'submitted' THEN v_status_label := 'Submitted';
      WHEN 'under_review' THEN v_status_label := 'Under Review';
      WHEN 'assigned' THEN v_status_label := 'Assigned';
      WHEN 'in_progress' THEN v_status_label := 'In Progress';
      WHEN 'resolved' THEN v_status_label := 'Resolved';
      WHEN 'rejected' THEN v_status_label := 'Closed';
      ELSE v_status_label := NEW.status;
    END CASE;

    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_complaint_id
    ) VALUES (
      NEW.student_id,
      'Complaint Status Updated',
      'Your complaint ' || NEW.ticket_number || ' is now ' || v_status_label || '.',
      'status_update',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_complaint_notification ON public.complaints;
CREATE TRIGGER trg_complaint_notification
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_complaint_notification();

-- ------------------------------------------------------------------------------
-- 3. AUTOMATED CLASS QUERY NOTIFICATIONS TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_class_query_notification()
RETURNS trigger AS $$
DECLARE
  v_student_name text;
  v_faculty_name text;
BEGIN
  -- Case 1: New Query Created -> Notify Faculty
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO v_student_name FROM public.profiles WHERE id = NEW.student_id;
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      NEW.faculty_id,
      'New Class Query Raised',
      'Student ' || coalesce(v_student_name, 'A student') || ' raised a query for ' || NEW.subject || ': ' || NEW.title,
      'class_query'
    );
    RETURN NEW;
  END IF;

  -- Case 2: Faculty Replied or Changed Status -> Notify Student
  IF TG_OP = 'UPDATE' AND (
    (NEW.faculty_response IS NOT NULL AND (OLD.faculty_response IS NULL OR NEW.faculty_response <> OLD.faculty_response)) OR
    (NEW.status <> OLD.status)
  ) THEN
    SELECT full_name INTO v_faculty_name FROM public.profiles WHERE id = NEW.faculty_id;
    
    IF NEW.faculty_response IS NOT NULL AND (OLD.faculty_response IS NULL OR NEW.faculty_response <> OLD.faculty_response) THEN
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type
      ) VALUES (
        NEW.student_id,
        'Query Answered by Faculty',
        'Your query for ' || NEW.subject || ' has been answered by ' || coalesce(v_faculty_name, 'faculty') || '.',
        'query_reply'
      );
    ELSE
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type
      ) VALUES (
        NEW.student_id,
        'Query Status Updated',
        'Your query for ' || NEW.subject || ' status changed to ' || NEW.status || '.',
        'query_status'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_class_query_notification ON public.class_queries;
CREATE TRIGGER trg_class_query_notification
  AFTER INSERT OR UPDATE ON public.class_queries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_class_query_notification();
