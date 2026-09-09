import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { queryService } from '../../services/query.service';
import { ClassQuery, QueryStatus } from '../../types/database.types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatTimeAgo } from '../../lib/utils';
import {
  HelpCircle,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Filter,
} from 'lucide-react';

export const StudentQueriesPage: React.FC = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState<ClassQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | QueryStatus>('all');

  const fetchQueries = async () => {
    if (!user) return;
    setLoading(true);
    const data = await queryService.getStudentQueries(user.id);
    setQueries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();
  }, [user]);

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      case 'in_progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      default:
        return <Badge variant="purple" size="sm">Open / Pending</Badge>;
    }
  };

  const filteredQueries = queries.filter((q) =>
    statusFilter === 'all' ? true : q.status === statusFilter
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Academic Queries</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {queries.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track question status, instructor feedback, and class clarifications you raised.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/student/timetable">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BookOpen className="w-4 h-4" />}
            >
              Class Timetable
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={fetchQueries} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            statusFilter === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All ({queries.length})
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            statusFilter === 'open'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Open ({queries.filter((q) => q.status === 'open').length})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            statusFilter === 'in_progress'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          In Progress ({queries.filter((q) => q.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            statusFilter === 'resolved'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Resolved ({queries.filter((q) => q.status === 'resolved').length})
        </button>
      </div>

      {/* Query List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500">Loading your queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No queries found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'You haven’t raised any questions yet. Go to your class timetable to raise queries directly to your instructors.'
                  : `No queries with status "${statusFilter}".`}
              </p>
            </div>
            <Link to="/student/timetable" className="mt-2">
              <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
                Go to Timetable
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((q) => (
            <Card key={q.id} className="p-5 space-y-4 hover:border-slate-300 transition-all">
              {/* Query Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {q.course_code && (
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                      {q.course_code}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-800">{q.subject}</span>
                  {getStatusBadge(q.status)}
                </div>
                <span className="text-[11px] text-slate-400">
                  Raised {formatTimeAgo(q.created_at)}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">{q.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {q.description}
                </p>
              </div>

              {/* Faculty Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Directed to:{' '}
                    <strong className="text-slate-700 font-semibold">
                      {q.faculty?.full_name || 'Assigned Instructor'}
                    </strong>
                  </span>
                </span>
                {q.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{q.room}</span>
                  </span>
                )}
              </div>

              {/* Faculty Response Section if available */}
              {q.faculty_response ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Response from {q.faculty?.full_name || 'Faculty'}:</span>
                    </div>
                    {q.responded_at && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {formatTimeAgo(q.responded_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed whitespace-pre-wrap font-sans">
                    {q.faculty_response}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Awaiting instructor review and clarification. You will receive an alert once answered.</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
