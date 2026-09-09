import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types/database.types';

export const COMPLAINT_CATEGORIES: { value: ComplaintCategory; label: string; icon: string }[] = [
  { value: 'hostel', label: 'Hostel & Residential', icon: 'Home' },
  { value: 'academic', label: 'Academic & Courses', icon: 'GraduationCap' },
  { value: 'infrastructure', label: 'Infrastructure & Labs', icon: 'Building' },
  { value: 'cafeteria', label: 'Cafeteria & Dining', icon: 'Utensils' },
  { value: 'sports', label: 'Sports & Recreation', icon: 'Activity' },
  { value: 'transport', label: 'Transport & Shuttle', icon: 'Bus' },
  { value: 'library', label: 'Library Services', icon: 'BookOpen' },
  { value: 'it_services', label: 'IT & Wi-Fi Network', icon: 'Wifi' },
  { value: 'other', label: 'Other Campus Affairs', icon: 'HelpCircle' },
];

export const COMPLAINT_PRIORITIES: { value: ComplaintPriority; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Minor non-urgent inconvenience' },
  { value: 'medium', label: 'Medium', description: 'Standard service request' },
  { value: 'high', label: 'High', description: 'Significant disruption to study/living' },
  { value: 'urgent', label: 'Urgent', description: 'Safety hazard or campus emergency' },
];

export const COMPLAINT_STATUSES: { value: ComplaintStatus; label: string; step: number }[] = [
  { value: 'submitted', label: 'Submitted', step: 1 },
  { value: 'under_review', label: 'Under Review', step: 2 },
  { value: 'assigned', label: 'Assigned', step: 3 },
  { value: 'in_progress', label: 'In Progress', step: 4 },
  { value: 'resolved', label: 'Resolved', step: 5 },
  { value: 'rejected', label: 'Rejected', step: -1 },
];

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  
  // Student
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_SUBMIT_COMPLAINT: '/student/complaints/new',
  STUDENT_MY_COMPLAINTS: '/student/complaints',
  STUDENT_COMPLAINT_DETAIL: (id: string = ':id') => `/student/complaints/${id}`,
  STUDENT_EVENTS: '/student/events',
  STUDENT_PROFILE: '/student/profile',

  // Faculty
  FACULTY_DASHBOARD: '/faculty/dashboard',
  FACULTY_ASSIGNED_COMPLAINTS: '/faculty/complaints',
  FACULTY_COMPLAINT_DETAIL: (id: string = ':id') => `/faculty/complaints/${id}`,

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ALL_COMPLAINTS: '/admin/complaints',
  ADMIN_COMPLAINT_DETAIL: (id: string = ':id') => `/admin/complaints/${id}`,
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_ANALYTICS: '/admin/analytics',
};
