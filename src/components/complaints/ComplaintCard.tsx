import React from 'react';
import { Link } from 'react-router-dom';
import { Complaint } from '../../types/database.types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatTimeAgo, getCategoryLabel } from '../../lib/utils';
import {
  MapPin,
  Calendar,
  User,
  Clock,
  Paperclip,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  baseUrl: string;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, baseUrl }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-subtle hover:shadow-elevated hover:border-pastel-lavender-300 transition-all duration-150 flex flex-col justify-between group">
      <div>
        {/* Header row: Ticket number, badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50/80 px-2 py-0.5 rounded-lg border border-brand-200/50">
              {complaint.ticket_number}
            </span>
            {complaint.is_anonymous && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                Anonymous
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
            {complaint.assigned_faculty_id ? (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 bg-pastel-lavender-50 px-2.5 py-0.5 rounded-full border border-pastel-lavender-200"
                title={`Assigned: ${complaint.assigned_faculty?.full_name || 'Faculty'}`}
              >
                <User className="w-3 h-3 text-brand-500" />
                <span className="truncate max-w-[130px]">
                  {complaint.assigned_faculty?.full_name || 'Assigned'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Clock className="w-3 h-3 text-amber-500" />
                Needs Assignment
              </span>
            )}
          </div>
        </div>

        {/* Title and summary */}
        <div className="mt-3">
          <Link
            to={`${baseUrl}/${complaint.id}`}
            className="block text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1"
          >
            {complaint.title}
          </Link>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* AI Insight Badge if present */}
        {complaint.ai_predicted_priority && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-brand-700 bg-pastel-lavender-50/80 px-2.5 py-1 rounded-lg border border-pastel-lavender-200/50">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">
              AI Priority: <strong className="capitalize">{complaint.ai_predicted_priority}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Footer metadata */}
      <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Location">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[130px]">
              {complaint.location}
              {complaint.building_room ? ` (${complaint.building_room})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1" title="Category">
            <span className="text-slate-400">•</span>
            <span className="truncate max-w-[120px] font-medium text-slate-600">
              {getCategoryLabel(complaint.category)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {complaint.attachments && complaint.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400" title="Attachments">
              <Paperclip className="w-3 h-3" />
              {complaint.attachments.length}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            {formatTimeAgo(complaint.created_at)}
          </span>
          <Link
            to={`${baseUrl}/${complaint.id}`}
            className="p-1 rounded-lg text-slate-400 group-hover:text-brand-600 group-hover:bg-pastel-lavender-50 transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
