import React, { useState, useEffect } from 'react';
import { queryService } from '../../services/query.service';
import { ClassQuery, QueryStatus } from '../../types/database.types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { formatTimeAgo } from '../../lib/utils';
import {
  HelpCircle,
  ShieldCheck,
  Search,
  Filter,
  User,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Inbox,
} from 'lucide-react';

export const AdminQueriesPage: React.FC = () => {
  const [queries, setQueries] = useState<ClassQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QueryStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchQueries = async () => {
    setLoading(true);
    const data = await queryService.getAllQueries();
    setQueries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      case 'in_progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      default:
        return <Badge variant="purple" size="sm">Open</Badge>;
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(s);
      const matchSubject = q.subject.toLowerCase().includes(s);
      const matchStudent = q.student?.full_name.toLowerCase().includes(s);
      const matchFaculty = q.faculty?.full_name.toLowerCase().includes(s);
      const matchCode = q.course_code?.toLowerCase().includes(s);
      if (!matchTitle && !matchSubject && !matchStudent && !matchFaculty && !matchCode) {
        return false;
      }
    }
    return true;
  });

  const openCount = queries.filter((q) => q.status === 'open').length;
  const inProgressCount = queries.filter((q) => q.status === 'in_progress').length;
  const resolvedCount = queries.filter((q) => q.status === 'resolved').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Academic Query Oversight
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Admin View-Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Campus-wide monitoring of student questions, instructor turnaround times, and resolution rates.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchQueries} disabled={loading}>
          Refresh List
        </Button>
      </div>

      {/* Read-Only Notice */}
      <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center gap-2.5 text-xs text-purple-900 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
        <div>
          <span className="font-bold">View-Only Administrative Oversight: </span>
          <span>
            Academic queries are private instructional dialogues between enrolled students and course faculty. Administrators have oversight to ensure resolution standards are met.
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            {queries.length}
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Campus Queries</p>
            <p className="text-base font-bold text-slate-800">All Departments</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {openCount}
          </div>
          <div>
            <p className="text-xs text-slate-400">Pending Response</p>
            <p className="text-base font-bold text-slate-800">Open</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            {inProgressCount}
          </div>
          <div>
            <p className="text-xs text-slate-400">Being Investigated</p>
            <p className="text-base font-bold text-slate-800">In Progress</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {resolvedCount}
          </div>
          <div>
            <p className="text-xs text-slate-400">Successfully Answered</p>
            <p className="text-base font-bold text-slate-800">Resolved</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by student, faculty, course code, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic Doubts</option>
            <option value="assignment">Assignments</option>
            <option value="lab_practical">Lab / Practical</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
      </div>

      {/* Queries List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500">Loading academic queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No queries found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No questions matching your current filters or search terms.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((q) => (
            <Card key={q.id} className="p-5 space-y-4 hover:border-slate-300 transition-all">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {q.course_code && (
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {q.course_code}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-800">{q.subject}</span>
                  {getStatusBadge(q.status)}
                  {q.category && (
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {q.category}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Raised {formatTimeAgo(q.created_at)}
                </span>
              </div>

              {/* Stakeholders: Student & Faculty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Student
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800 mt-0.5">
                    <User className="w-3.5 h-3.5 text-brand-600" />
                    <span>{q.student?.full_name || 'Student'}</span>
                    {q.student?.student_id_number && (
                      <span className="text-slate-400">({q.student.student_id_number})</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Assigned Faculty
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800 mt-0.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>{q.faculty?.full_name || 'Faculty Member'}</span>
                    {q.room && (
                      <span className="text-slate-400"> • {q.room}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">{q.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200">
                  {q.description}
                </p>
              </div>

              {/* Faculty Response */}
              {q.faculty_response ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Faculty Response ({q.faculty?.full_name || 'Instructor'}):
                    </span>
                    {q.responded_at && (
                      <span className="text-[10px] text-emerald-600">
                        {formatTimeAgo(q.responded_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-950 whitespace-pre-wrap">
                    {q.faculty_response}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pending faculty reply</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
