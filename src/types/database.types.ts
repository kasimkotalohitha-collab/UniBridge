export type UserRole = 'student' | 'faculty' | 'admin';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintCategory =
  | 'hostel'
  | 'academic'
  | 'infrastructure'
  | 'cafeteria'
  | 'sports'
  | 'transport'
  | 'library'
  | 'it_services'
  | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  student_id_number?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at?: string | null;
  department?: Department | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  head_faculty_id?: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  ticket_number: string;
  student_id: string | null;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  building_room?: string | null;
  is_anonymous: boolean;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  department_id?: string | null;
  assigned_faculty_id?: string | null;
  attachments?: string[] | null;
  ai_predicted_category?: string | null;
  ai_predicted_priority?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at?: string | null;
  resolved_at?: string | null;
  // Joins
  student?: {
    id: string;
    full_name: string;
    email: string;
    student_id_number?: string | null;
  } | null;
  department?: Department | null;
  assigned_faculty?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface ComplaintTimeline {
  id: string;
  complaint_id: string;
  actor_id: string | null;
  action: string;
  old_value?: string | null;
  new_value?: string | null;
  remarks?: string | null;
  created_at: string;
  actor?: {
    id: string;
    full_name: string;
    role: UserRole;
  } | null;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    role: UserRole;
  } | null;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  location: string;
  event_date: string;
  category: string;
  created_by?: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | 'complaint_status'
    | 'assignment'
    | 'event'
    | 'system'
    | 'status_update'
    | 'class_query'
    | 'query_reply'
    | 'query_status'
    | string;
  related_complaint_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export type QueryStatus = 'open' | 'in_progress' | 'resolved';

export interface ClassQuery {
  id: string;
  student_id: string;
  faculty_id: string;
  department_id?: string | null;
  subject: string;
  course_code?: string;
  room?: string;
  title: string;
  description: string;
  category?: string;
  status: QueryStatus;
  faculty_response?: string | null;
  responded_at?: string | null;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    full_name: string;
    email: string;
    student_id_number?: string;
  } | null;
  faculty?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  department?: Department | null;
}
