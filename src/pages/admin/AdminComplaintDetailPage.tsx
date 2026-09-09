import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaint.service';
import { departmentService } from '../../services/department.service';
import {
  Complaint,
  ComplaintTimeline,
  ComplaintComment,
  Department,
  ComplaintStatus,
  ComplaintPriority,
} from '../../types/database.types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Textarea';
import { Spinner } from '../../components/common/Spinner';
import { ComplaintTimelineView } from '../../components/complaints/ComplaintTimelineView';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import { AssignComplaintModal } from '../../components/complaints/AssignComplaintModal';
import {
  formatDateTime,
  formatTimeAgo,
  getCategoryLabel,
} from '../../lib/utils';
import { COMPLAINT_PRIORITIES } from '../../lib/constants';
import {
  ArrowLeft,
  MapPin,
  Building,
  User,
  Calendar,
  Sparkles,
  Paperclip,
  Send,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Edit3,
  UserCheck,
  Lock,
  Clock,
} from 'lucide-react';

export const AdminComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimeline[]>([]);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // New comment
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [compData, timelineData, commentsData, deptsData] = await Promise.all([
        complaintService.getComplaintById(id, user?.id),
        complaintService.getTimeline(id),
        complaintService.getComments(id),
        departmentService.getDepartments(),
      ]);
      setComplaint(compData);
      setTimeline(timelineData);
      setComments(commentsData);
      setDepartments(deptsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleUpdateStatus = async (newStatus: ComplaintStatus, remarks: string) => {
    if (!complaint || !user) return;
    const ok = await complaintService.updateStatus(
      complaint.id,
      newStatus,
      remarks,
      user.id,
      complaint.status
    );
    if (ok) loadData();
  };

  const handleAssign = async (deptId: string, facultyId: string, remarks?: string) => {
    if (!complaint || !user) return;
    const ok = await complaintService.assignComplaint(
      complaint.id,
      deptId,
      facultyId,
      user.id,
      remarks
    );
    if (ok) {
      await loadData();
    } else {
      throw new Error('Failed to update complaint assignment in database.');
    }
  };

  const handlePriorityChange = async (newPriority: ComplaintPriority) => {
    if (!complaint || !user) return;
    const ok = await complaintService.updatePriority(complaint.id, newPriority, user.id);
    if (ok) loadData();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await complaintService.addComment(
        id,
        user.id,
        commentText.trim(),
        isInternal
      );
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        setCommentText('');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner label="Loading administrative details..." size="lg" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center space-y-4">
        <h3 className="text-base font-semibold text-slate-800">Complaint Not Found</h3>
        <Link to="/admin/complaints">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Complaints
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Grievances
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatusModalOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Update Status
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
          >
            {complaint.assigned_faculty_id ? 'Reassign / Route' : 'Assign / Route'}
          </Button>
        </div>
      </div>

      {/* Main Administrative Card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-xl border border-brand-200">
              {complaint.ticket_number}
            </span>
            {complaint.is_anonymous ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Submitted Anonymously
              </span>
            ) : (
              <span className="text-xs text-slate-600">
                Student: <strong>{complaint.student?.full_name}</strong>{' '}
                <span className="text-slate-400">({complaint.student?.email})</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Priority Override Selector */}
            <select
              value={complaint.priority}
              onChange={(e) => handlePriorityChange(e.target.value as ComplaintPriority)}
              className="text-xs font-semibold py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
            >
              {COMPLAINT_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} Priority
                </option>
              ))}
            </select>
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {complaint.title}
          </h1>
          <p className="text-sm text-slate-600 mt-2.5 whitespace-pre-line leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Category</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {getCategoryLabel(complaint.category)}
            </p>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Location</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {complaint.location}
              {complaint.building_room ? ` (${complaint.building_room})` : ''}
            </p>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Department</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {complaint.department?.name || 'Unassigned'}
            </p>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Assigned Faculty</span>
            <div className="mt-0.5">
              {complaint.assigned_faculty_id ? (
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{complaint.assigned_faculty?.full_name || 'Assigned'}</span>
                </p>
              ) : (
                <p className="font-semibold text-amber-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Needs Assignment</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Details */}
        {complaint.ai_predicted_category && (
          <div className="mt-6 p-4 bg-gradient-to-r from-pastel-lavender-50 to-pastel-pink-50 rounded-2xl border border-pastel-lavender-200/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800">
                Gemini AI Triage Assessment
              </span>
              <p className="text-slate-600 mt-0.5">
                Predicted: <strong>{getCategoryLabel(complaint.ai_predicted_category)}</strong> (Priority:{' '}
                <strong className="capitalize">{complaint.ai_predicted_priority}</strong>).
              </p>
              {complaint.ai_summary && (
                <p className="text-slate-500 italic mt-1">&quot;{complaint.ai_summary}&quot;</p>
              )}
            </div>
          </div>
        )}

        {/* Attachments */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Attachments ({complaint.attachments.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {complaint.attachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-brand-300 transition-colors p-2 text-center"
                >
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-150"
                  />
                  <span className="inline-flex items-center gap-1 text-[10px] text-brand-600 mt-1 font-medium">
                    Inspect <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 2-Column Split: Timeline & Discussion */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Audit Timeline & Status Changes
          </h3>
          <ComplaintTimelineView timeline={timeline} />
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Staff Notes & Discussion
            </h3>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No discussion records yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      comment.is_internal
                        ? 'bg-amber-50/80 border border-amber-200'
                        : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {comment.author?.full_name || 'Staff Member'}
                        </span>
                        {comment.is_internal && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Lock className="w-2.5 h-2.5" /> Internal Only
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
            <Textarea
              placeholder="Post a response or administrative internal note..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              required
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
                <span className="font-medium">Internal staff note only</span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={submittingComment}
                disabled={submittingComment || !commentText.trim()}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Note
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Modals */}
      {isStatusModalOpen && (
        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          complaint={complaint}
          onUpdate={handleUpdateStatus}
        />
      )}

      {isAssignModalOpen && (
        <AssignComplaintModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          complaint={complaint}
          departments={departments}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
};
