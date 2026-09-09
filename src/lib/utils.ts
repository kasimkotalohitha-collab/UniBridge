import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'under_review':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'assigned':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'in_progress':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getPriorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
    case 'high':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'medium':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    case 'low':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    hostel: 'Hostel & Residential',
    academic: 'Academic & Courses',
    infrastructure: 'Infrastructure & Labs',
    cafeteria: 'Cafeteria & Dining',
    sports: 'Sports & Recreation',
    transport: 'Transport & Shuttle',
    library: 'Library Services',
    it_services: 'IT & Wi-Fi Network',
    other: 'Other Campus Affairs',
  };
  return map[category] || category;
}
