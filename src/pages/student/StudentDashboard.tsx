import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaint.service';
import { eventService } from '../../services/event.service';
import { timetableService, TimetableEntry } from '../../services/timetable.service';
import { Complaint, CampusEvent } from '../../types/database.types';
import { StatCard } from '../../components/analytics/StatCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { EventCard } from '../../components/events/EventCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  FilePlus2,
  ListTodo,
  CheckCircle2,
  Clock,
  CalendarDays,
  Calendar,
  ArrowRight,
  Sparkles,
  MapPin,
  User,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [complaintsData, eventsData, classesData] = await Promise.all([
          complaintService.getComplaints({ student_id: user.id }),
          eventService.getEvents(),
          timetableService.getTodayClasses(),
        ]);
        setComplaints(complaintsData);
        setEvents(eventsData.slice(0, 2));
        setTodayClasses(classesData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const openComplaints = complaints.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review' || c.status === 'assigned'
  ).length;
  const inProgressComplaints = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'resolved').length;

  const displayName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-pastel-lavender-100 via-white to-pastel-pink-100 rounded-3xl p-6 sm:p-8 border border-pastel-lavender-200/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-pastel-lavender-200 text-brand-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Student Campus Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {displayName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Track your campus grievances, review departmental resolutions, or view your class timetable for today.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/student/complaints/new" className="shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<FilePlus2 className="w-4 h-4" />}
              className="shadow-sm shadow-brand-500/25"
            >
              Report an Issue
            </Button>
          </Link>
          <Link to="/student/timetable" className="shrink-0">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<CalendarDays className="w-4 h-4" />}
            >
              View Timetable
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Complaints"
          value={openComplaints}
          subtitle="Submitted or in review"
          icon={<ListTodo className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="In Progress"
          value={inProgressComplaints}
          subtitle="Being actively worked on"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Resolved"
          value={resolvedComplaints}
          subtitle="Successfully closed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Upcoming Classes"
          value={todayClasses.length}
          subtitle="Sessions scheduled today"
          icon={<CalendarDays className="w-5 h-5" />}
          variant="pink"
        />
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/student/complaints/new"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-lavender-100 flex items-center justify-center text-brand-700 group-hover:scale-105 transition-transform">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Report an Issue</span>
              <span className="text-[11px] text-slate-400">Faculty, infrastructure, or campus affairs</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          to="/student/complaints"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-pink-100 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">View My Complaints</span>
              <span className="text-[11px] text-slate-400">Track resolution progress & timeline</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          to="/student/timetable"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">View Timetable</span>
              <span className="text-[11px] text-slate-400">Today's lectures, labs & rooms</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
        </Link>
      </div>

      {/* Main Grid: Complaints & Today's Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Complaints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
              <p className="text-xs text-slate-500">Your latest logged grievances and status</p>
            </div>
            {complaints.length > 0 && (
              <Link
                to="/student/complaints"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                View all ({complaints.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner label="Loading your complaints..." />
            </div>
          ) : complaints.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pastel-lavender-100 flex items-center justify-center mx-auto text-brand-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Complaints Submitted</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t logged any campus issues yet. If something needs attention, report it and our AI triage will route it.
              </p>
              <Link to="/student/complaints/new" className="inline-block pt-1">
                <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-4 h-4" />}>
                  Submit First Issue
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {complaints.slice(0, 3).map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  baseUrl="/student/complaints"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Today's Timetable & Campus Events */}
        <div className="space-y-6">
          {/* Today's Schedule Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Today&apos;s Classes
                </h3>
              </div>
              <Link
                to="/student/timetable"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Schedule <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {todayClasses.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No classes scheduled for today!
              </p>
            ) : (
              <div className="space-y-2.5">
                {todayClasses.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate max-w-[170px]">
                        {c.subject}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-brand-600">
                        {c.startTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.room}
                      </span>
                      <span className="text-slate-400 truncate max-w-[110px]">
                        {c.faculty.split(' ')[0]} {c.faculty.split(' ')[1]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Campus Events Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Campus Events
                </h3>
              </div>
              <Link
                to="/student/events"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            </div>

            {events.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-xs text-slate-400 italic">No upcoming campus events</p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
