-- UniBridge Database Schema
-- Migration 001: Initial Schema, Enums, Tables, Sequences, Triggers, and RLS

-- 1. ENUMS
create type user_role as enum ('student', 'faculty', 'admin');
create type complaint_status as enum ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected');
create type complaint_priority as enum ('low', 'medium', 'high', 'urgent');
create type complaint_category as enum (
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

-- 2. DEPARTMENTS TABLE
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  description text,
  head_faculty_id uuid, -- Reference to profiles.id added later
  created_at timestamptz default now() not null
);

-- 3. PROFILES TABLE (Linked 1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null default 'student',
  department_id uuid references public.departments(id) on delete set null,
  student_id_number text,
  phone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now()
);

-- Circular reference: add foreign key to departments.head_faculty_id
alter table public.departments 
  add constraint fk_head_faculty 
  foreign key (head_faculty_id) 
  references public.profiles(id) 
  on delete set null;

-- 4. AUTO-GENERATE TICKET NUMBER SEQUENCE
create sequence if not exists complaint_ticket_seq start with 1 increment by 1;

create or replace function generate_complaint_ticket()
returns text as $$
declare
  curr_year text;
  next_val integer;
begin
  curr_year := to_char(current_date, 'YYYY');
  next_val := nextval('complaint_ticket_seq');
  return 'UB-' || curr_year || '-' || lpad(next_val::text, 4, '0');
end;
$$ language plpgsql;

-- 5. COMPLAINTS TABLE
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null default generate_complaint_ticket(),
  student_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  category complaint_category not null default 'other',
  location text not null,
  building_room text,
  is_anonymous boolean not null default false,
  status complaint_status not null default 'submitted',
  priority complaint_priority not null default 'medium',
  department_id uuid references public.departments(id) on delete set null,
  assigned_faculty_id uuid references public.profiles(id) on delete set null,
  attachments text[] default '{}',
  ai_predicted_category text,
  ai_predicted_priority text,
  ai_summary text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now(),
  resolved_at timestamptz
);

-- 6. COMPLAINT TIMELINE / AUDIT TRAIL
create table if not exists public.complaint_timeline (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null, -- 'created', 'status_changed', 'priority_changed', 'assigned', 'remarks'
  old_value text,
  new_value text,
  remarks text,
  created_at timestamptz default now() not null
);

-- 7. COMPLAINT COMMENTS
create table if not exists public.complaint_comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_internal boolean not null default false, -- True for faculty/admin only notes
  created_at timestamptz default now() not null
);

-- 8. CAMPUS EVENTS TABLE
create table if not exists public.campus_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  organizer text not null,
  location text not null,
  event_date timestamptz not null,
  category text not null default 'General',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

-- 9. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'system', -- 'complaint_status', 'assignment', 'event', 'system'
  related_complaint_id uuid references public.complaints(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz default now() not null
);

-- 10. INDEXES FOR PERFORMANCE
create index if not exists idx_complaints_student_id on public.complaints(student_id);
create index if not exists idx_complaints_department_id on public.complaints(department_id);
create index if not exists idx_complaints_assigned_faculty on public.complaints(assigned_faculty_id);
create index if not exists idx_complaints_status on public.complaints(status);
create index if not exists idx_complaints_priority on public.complaints(priority);
create index if not exists idx_complaints_created_at on public.complaints(created_at desc);
create index if not exists idx_timeline_complaint_id on public.complaint_timeline(complaint_id);
create index if not exists idx_comments_complaint_id on public.complaint_comments(complaint_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id, is_read);

-- 11. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role := 'student'::public.user_role;
  v_raw_role text;
  v_full_name text;
  v_phone text;
  v_student_id text;
  v_raw_dept text;
  v_dept_id uuid := null;
begin
  -- 1. Safely resolve full_name with sensible fallback to email prefix
  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');
  if v_full_name is null then
    v_full_name := coalesce(split_part(new.email, '@', 1), 'Campus Member');
  end if;

  -- 2. Safely resolve role (must be one of 'student', 'faculty', 'admin')
  v_raw_role := lower(trim(coalesce(new.raw_user_meta_data->>'role', 'student')));
  if v_raw_role in ('student', 'faculty', 'admin') then
    v_role := v_raw_role::public.user_role;
  else
    v_role := 'student'::public.user_role;
  end if;

  -- 3. Safely resolve optional string metadata (empty strings converted to NULL)
  v_student_id := nullif(trim(coalesce(new.raw_user_meta_data->>'student_id_number', '')), '');
  v_phone := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');

  -- 4. Safely resolve department_id:
  --    Must match UUID regex format AND exist in public.departments to avoid FK constraint violation
  v_raw_dept := trim(coalesce(new.raw_user_meta_data->>'department_id', ''));
  if v_raw_dept ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id into v_dept_id
    from public.departments
    where id = v_raw_dept::uuid;
  end if;

  -- 5. Safe upsert into public.profiles
  begin
    insert into public.profiles (
      id,
      email,
      full_name,
      role,
      student_id_number,
      phone,
      department_id,
      created_at,
      updated_at
    ) values (
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
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, profiles.full_name),
      role = coalesce(excluded.role, profiles.role),
      student_id_number = coalesce(excluded.student_id_number, profiles.student_id_number),
      phone = coalesce(excluded.phone, profiles.phone),
      department_id = coalesce(excluded.department_id, profiles.department_id),
      updated_at = now();
  exception
    when others then
      -- Log error details to PostgreSQL log without aborting the auth signup transaction
      raise warning 'handle_new_user: Failed to insert/update profile for user %: % (SQLSTATE: %)',
        new.id, sqlerrm, sqlstate;
  end;

  return new;
end;
$$;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 12. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_timeline enable row level security;
alter table public.complaint_comments enable row level security;
alter table public.campus_events enable row level security;
alter table public.notifications enable row level security;

-- Helper security functions
create or replace function public.get_current_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

create or replace function public.is_admin()
returns boolean as $$
  select coalesce(public.get_current_role() = 'admin', false);
$$ language sql security definer stable;

create or replace function public.is_faculty()
returns boolean as $$
  select coalesce(public.get_current_role() = 'faculty', false);
$$ language sql security definer stable;

-- PROFILES POLICIES
create policy "Public profiles viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- DEPARTMENTS POLICIES
create policy "Departments viewable by authenticated users"
  on public.departments for select
  to authenticated
  using (true);

create policy "Admins can manage departments"
  on public.departments for all
  to authenticated
  using (public.is_admin());

-- COMPLAINTS POLICIES
-- Students can insert their own complaints
create policy "Students can submit complaints"
  on public.complaints for insert
  to authenticated
  with check (auth.uid() = student_id);

-- Students can view their own complaints; Faculty and Admins can view all appropriate complaints
create policy "Complaints read policy"
  on public.complaints for select
  to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
    or (
      public.is_faculty() and (
        assigned_faculty_id = auth.uid() 
        or department_id in (select department_id from public.profiles where id = auth.uid())
      )
    )
  );

-- Admins can update any complaint (status, priority, department, faculty)
create policy "Admins can update complaints"
  on public.complaints for update
  to authenticated
  using (public.is_admin());

-- Faculty can update complaints assigned to them (status, remarks)
create policy "Faculty can update assigned complaints"
  on public.complaints for update
  to authenticated
  using (
    public.is_faculty() and (
      assigned_faculty_id = auth.uid() 
      or department_id in (select department_id from public.profiles where id = auth.uid())
    )
  );

-- COMPLAINT TIMELINE POLICIES
create policy "Timeline viewable by complaint stakeholders"
  on public.complaint_timeline for select
  to authenticated
  using (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_timeline.complaint_id
      and (c.student_id = auth.uid() or public.is_admin() or public.is_faculty())
    )
  );

create policy "Stakeholders can insert timeline logs"
  on public.complaint_timeline for insert
  to authenticated
  with check (auth.uid() = actor_id or public.is_admin());

-- COMPLAINT COMMENTS POLICIES
create policy "Comments viewable by stakeholders (internal filtered for students)"
  on public.complaint_comments for select
  to authenticated
  using (
    exists (
      select 1 from public.complaints c
      where c.id = complaint_comments.complaint_id
      and (
        -- Admins and faculty can see all comments including internal
        public.is_admin() or public.is_faculty()
        -- Students can only see non-internal comments on their tickets
        or (c.student_id = auth.uid() and not complaint_comments.is_internal)
      )
    )
  );

create policy "Stakeholders can insert comments"
  on public.complaint_comments for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and (
      -- If student, cannot create internal notes
      (public.get_current_role() = 'student' and not is_internal)
      or public.is_faculty()
      or public.is_admin()
    )
  );

-- CAMPUS EVENTS POLICIES
create policy "Campus events viewable by all authenticated users"
  on public.campus_events for select
  to authenticated
  using (true);

create policy "Faculty and admins can create campus events"
  on public.campus_events for insert
  to authenticated
  with check (public.is_faculty() or public.is_admin());

create policy "Faculty and admins can manage campus events"
  on public.campus_events for update
  to authenticated
  using (public.is_faculty() or public.is_admin());

-- NOTIFICATIONS POLICIES
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can mark their own notifications as read"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on public.notifications for insert
  to authenticated
  with check (true);
