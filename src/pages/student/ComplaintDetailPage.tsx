import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaint.service';
import {
  Complaint,
  ComplaintTimeline,
  ComplaintComment,
} from '../../types/database.types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Textarea';
import { Spinner } from '../../components/common/Spinner';
import { ComplaintTimelineView } from '../../components/complaints/ComplaintTimelineView';
import {
  formatDateTime,
  formatTimeAgo,
  getCategoryLabel,
} from '../../lib/utils';
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
} from 'lucide-react';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimeline[]>([]);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [loading, setLoading] = useState(true);

  // New comment input
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [compData, timelineData, commentsData] = await Promise.all([
        complaintService.getComplaintById(id, user?.id),
        complaintService.getTimeline(id),
        complaintService.getComments(id),
      ]);
      setComplaint(compData);
      setTimeline(timelineData);
      setComments(commentsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await complaintService.addComment(
        id,
        user.id,
        commentText.trim(),
        false
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
        <Spinner label="Loading ticket details..." size="lg" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center space-y-4">
        <h3 className="text-base font-semibold text-slate-800">Complaint Not Found</h3>
        <p className="text-xs text-slate-500">
          This complaint does not exist or you do not have permission to view it.
        </p>
        <Link to="/student/complaints">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Complaints
          </Button>
        </Link>
      </div>
    );
  }

  // Progress Stepper steps
  const steps = [
    { label: 'Submitted', key: 'submitted' },
    { label: 'Under Review', key: 'under_review' },
    { label: 'Assigned', key: 'assigned' },
    { label: 'In Progress', key: 'in_progress' },
    { label: 'Resolved', key: 'resolved' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === complaint.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Complaints
        </Link>
      </div>

      {/* Ticket Main Header Card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-xl border border-brand-200">
              {complaint.ticket_number}
            </span>
            {complaint.is_anonymous && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Submitted Anonymously
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
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

        {/* Progress Stepper Bar */}
        {complaint.status !== 'rejected' && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Resolution Progress
            </p>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-300 -z-0"
                style={{
                  width: `${
                    currentStepIndex >= 0
                      ? (currentStepIndex / (steps.length - 1)) * 100
                      : 0
                  }%`,
                }}
              />

              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={step.key} className="flex flex-col items-center z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        isPassed
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-pastel-lavender-200' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                        isCurrent
                          ? 'text-brand-700 font-bold'
                          : isPassed
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            <p className="font-semibold text-slate-800 mt-0.5">
              {complaint.assigned_faculty?.full_name || 'Pending assignment'}
            </p>
          </div>
        </div>

        {/* AI Insight Box */}
        {complaint.ai_predicted_category && (
          <div className="mt-6 p-4 bg-gradient-to-r from-pastel-lavender-50 to-pastel-pink-50 rounded-2xl border border-pastel-lavender-200/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800">
                Gemini AI Triage Insight
              </span>
              <p className="text-slate-600 mt-0.5">
                Classified under <strong>{getCategoryLabel(complaint.ai_predicted_category)}</strong> with{' '}
                <strong className="capitalize">{complaint.ai_predicted_priority}</strong> priority.
              </p>
              {complaint.ai_summary && (
                <p className="text-slate-500 italic mt-1">&quot;{complaint.ai_summary}&quot;</p>
              )}
            </div>
          </div>
        )}

        {/* Attachments Section */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Attachments ({complaint.attachments.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {complaint.attachments.map((url, idx) => {
                const isImage = url.match(/\.(jpeg|jpg|png|webp)($|\?)/i);
                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-brand-300 transition-colors p-2 text-center"
                  >
                    {isImage ? (
                      <img
                        src={url}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-150"
                      />
                    ) : (
                      <div className="w-full h-24 flex flex-col items-center justify-center text-slate-400">
                        <Paperclip className="w-6 h-6" />
                        <span className="text-[10px] mt-1 font-medium">Document #{idx + 1}</span>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] text-brand-600 mt-1 font-medium">
                      View full file <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* 2-Column Split: Timeline & Discussion */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline Log */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Audit Timeline & Status Changes
          </h3>
          <ComplaintTimelineView timeline={timeline} />
        </Card>

        {/* Public Comments & Queries */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Discussion & Inquiries
            </h3>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No discussion yet. Post a question or update below.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      comment.author_id === user?.id
                        ? 'bg-pastel-lavender-50 border border-pastel-lavender-200/80 ml-4'
                        : 'bg-slate-50 border border-slate-100 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">
                        {comment.author?.full_name || 'Campus Member'}
                        <span className="text-slate-400 font-normal ml-1">
                          ({comment.author?.role})
                        </span>
                      </span>
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

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <Textarea
              placeholder="Ask for an update or post additional context..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={submittingComment}
                disabled={submittingComment || !commentText.trim()}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Post Reply
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
