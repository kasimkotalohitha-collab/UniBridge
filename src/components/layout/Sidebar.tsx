import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  FilePlus2,
  ListTodo,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  BarChart3,
  CheckSquare,
  Sparkles,
  CalendarDays,
  X,
  HelpCircle,
  Bell,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const studentNavItems = [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Submit Issue', to: '/student/complaints/new', icon: FilePlus2, highlight: true, end: true },
    { label: 'My Complaints', to: '/student/complaints', icon: ListTodo, end: true },
    { label: 'My Timetable', to: '/student/timetable', icon: CalendarDays, end: true },
    { label: 'Class Queries', to: '/student/queries', icon: HelpCircle, end: true },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Campus Events', to: '/student/events', icon: Calendar },
    { label: 'My Profile', to: '/student/profile', icon: User },
  ];

  const facultyNavItems = [
    { label: 'Faculty Dashboard', to: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Complaints', to: '/faculty/complaints', icon: CheckSquare },
    { label: 'Class Queries', to: '/faculty/queries', icon: HelpCircle, end: true },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Campus Events', to: '/student/events', icon: Calendar },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Complaints', to: '/admin/complaints', icon: ShieldCheck },
    { label: 'Class Queries', to: '/admin/queries', icon: HelpCircle, end: true },
    { label: 'Departments', to: '/admin/departments', icon: Building2 },
    { label: 'Campus Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Campus Events', to: '/student/events', icon: Calendar },
  ];

  let navItems = studentNavItems;
  if (role === 'faculty') navItems = facultyNavItems;
  if (role === 'admin') navItems = adminNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={cn(
          'fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {role === 'admin' ? 'Administration' : role === 'faculty' ? 'Faculty Portal' : 'Student Hub'}
            </p>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-pastel-lavender-100 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    item.highlight && !isActive && 'text-brand-600 bg-brand-50/50 hover:bg-brand-50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive
                          ? 'text-brand-600'
                          : 'text-slate-400 group-hover:text-slate-600',
                        item.highlight && !isActive && 'text-brand-600'
                      )}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom AI Status badge */}
        <div className="p-3 m-3 bg-gradient-to-br from-pastel-pink-50/60 to-pastel-lavender-50 rounded-2xl border border-pastel-lavender-200/60">
          <div className="flex items-center gap-2 mb-1 text-brand-700">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-semibold">Gemini AI Assistant</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Automatic categorization and priority detection active on issue submissions.
          </p>
        </div>
      </aside>
    </>
  );
};
