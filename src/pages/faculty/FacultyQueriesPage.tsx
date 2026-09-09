import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
  MapPin,
  Send,
  AlertCircle,
  Sparkles,
  Inbox,
} from 'lucide-react';

export const FacultyQueriesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [queries, setQueries] = useState<ClassQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | QueryStatus>('all');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [replyStatus, setReplyStatus] = useState<{ [id: string]: QueryStatus }>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchQueries = async () => {
    if (!user) return;
    setLoading(true);
    const data = await queryService.getFacultyQueries(user.id);
    setQueries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();
  }, [user]);

  const handleStartReply = (q: ClassQuery) => {
    setActiveReplyId(q.id);
    setReplyText((prev) => ({
      ...prev,
      [q.id]: prev[q.id] !== undefined ? prev[q.id] : q.faculty_response || '',
    }));
    setReplyStatus((prev) => ({
      ...prev,
      [q.id]: prev[q.id] || q.status,
    }));
  };

  const handleSubmitResponse = async (q: ClassQuery) => {
    if (!user) return;
    const text = (replyText[q.id] || '').trim();
    const status = replyStatus[q.id] || 'resolved';

    if (!text) return;

    setSubmittingId(q.id);
    const res = await queryService.respondToQuery({
      queryId: q.id,
      facultyId: user.id,
      facultyResponse: text,
      newStatus: status,
      studentId: q.student_id,
      subject: q.subject,
      facultyName: profile?.full_name || 'Instructor',
    });

    setSubmittingId(null);
    if (res.success) {
      setSuccessMsg(`Query response saved and marked as ${status}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setActiveReplyId(null);
      // Refresh list
      fetchQueries();
    }
  };

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

  const openCount = queries.filter((q) => q.status === 'open').length;
  const inProgressCount = queries.filter((q) => q.status === 'in_progress').length;
  const resolvedCount = queries.filter((q) => q.status === 'resolved').length;

  const filteredQueries = queries.filter((q) =>
    statusFilter === 'all' ? true : q.status === statusFilter
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Class Academic Queries</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Instructor Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Questions and academic clarifications raised by enrolled students across your scheduled courses.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchQueries} disabled={loading}>
          Refresh List
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            {queries.length}
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Queries</p>
            <p className="text-base font-bold text-slate-800">All Time</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {openCount}
          </div>
          <div>
            <p className="text-xs text-slate-400">Needs Response</p>
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
            <p className="text-xs text-slate-400">Resolved</p>
            <p className="text-base font-bold text-slate-800">Answered</p>
          </div>
        </Card>
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
          Open ({openCount})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            statusFilter === 'in_progress'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            statusFilter === 'resolved'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Query List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500">Loading student queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No student queries found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'No students have raised queries for your courses yet.'
                  : `No queries currently matching status "${statusFilter}".`}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((q) => {
            const isReplying = activeReplyId === q.id;
            const currentResponse = replyText[q.id] !== undefined ? replyText[q.id] : q.faculty_response || '';
            const currentSelectedStatus = replyStatus[q.id] || (q.status === 'open' ? 'resolved' : q.status);

            return (
              <Card key={q.id} className="p-5 space-y-4 hover:border-slate-300 transition-all">
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {q.course_code && (
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
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

                {/* Student Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1 font-medium text-slate-800">
                    <User className="w-3.5 h-3.5 text-brand-600" />
                    <span>Student: {q.student?.full_name || 'Enrolled Student'}</span>
                  </span>
                  {q.student?.student_id_number && (
                    <span className="text-slate-500">
                      ID: {q.student.student_id_number}
                    </span>
                  )}
                  {q.student?.email && (
                    <span className="text-slate-400">
                      ({q.student.email})
                    </span>
                  )}
                  {q.room && (
                    <span className="flex items-center gap-1 text-slate-500 ml-auto">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{q.room}</span>
                    </span>
                  )}
                </div>

                {/* Query details */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">{q.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200">
                    {q.description}
                  </p>
                </div>

                {/* Existing Faculty Response if any */}
                {q.faculty_response && !isReplying && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Your Response to Student:
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
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartReply(q)}
                        className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
                      >
                        Edit Response / Change Status
                      </Button>
                    </div>
                  </div>
                )}

                {/* Inline Reply Form */}
                {isReplying ? (
                  <div className="p-4 rounded-2xl bg-brand-50/40 border border-brand-200 space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-brand-600" />
                        Provide Instructor Clarification & Resolution
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Update Query Status
                      </label>
                      <select
                        value={currentSelectedStatus}
                        onChange={(e) =>
                          setReplyStatus((prev) => ({
                            ...prev,
                            [q.id]: e.target.value as QueryStatus,
                          }))
                        }
                        className="text-xs rounded-xl border border-slate-200 p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="resolved">Resolved (Complete answer provided)</option>
                        <option value="in_progress">In Progress (Investigating / Follow-up required)</option>
                        <option value="open">Open (Keep pending)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Response Message
                      </label>
                      <textarea
                        rows={4}
                        value={currentResponse}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder="Write your response, solution, or guidance clearly for the student..."
                        className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveReplyId(null)}
                        disabled={submittingId === q.id}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitResponse(q)}
                        isLoading={submittingId === q.id}
                        disabled={!currentResponse.trim()}
                        leftIcon={<Send className="w-4 h-4" />}
                      >
                        Submit Response & Notify Student
                      </Button>
                    </div>
                  </div>
                ) : (
                  !q.faculty_response && (
                    <div className="pt-1 flex items-center justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartReply(q)}
                        leftIcon={<MessageSquare className="w-4 h-4" />}
                      >
                        Reply & Resolve Query
                      </Button>
                    </div>
                  )
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
