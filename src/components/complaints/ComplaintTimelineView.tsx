import React from 'react';
import { ComplaintTimeline } from '../../types/database.types';
import { formatDateTime } from '../../lib/utils';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  MessageSquare,
} from 'lucide-react';

interface ComplaintTimelineViewProps {
  timeline: ComplaintTimeline[];
}

export const ComplaintTimelineView: React.FC<ComplaintTimelineViewProps> = ({
  timeline,
}) => {
  if (timeline.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No timeline events recorded yet.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="w-4 h-4 text-brand-600" />;
      case 'status_changed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'assigned':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'priority_changed':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'remarks':
      default:
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-brand-50 border-brand-200';
      case 'status_changed':
        return 'bg-emerald-50 border-emerald-200';
      case 'assigned':
        return 'bg-purple-50 border-purple-200';
      case 'priority_changed':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {timeline.map((item) => (
        <div key={item.id} className="relative group">
          {/* Timeline bullet icon */}
          <div
            className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-xs ${getActionBadgeColor(
              item.action
            )}`}
          >
            {getActionIcon(item.action)}
          </div>

          <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100/80">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 capitalize">
                  {item.action.replace('_', ' ')}
                </span>
                {item.actor && (
                  <span className="text-[11px] text-slate-500">
                    by <strong className="text-slate-700">{item.actor.full_name}</strong>{' '}
                    <span className="text-slate-400 font-normal">({item.actor.role})</span>
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3" />
                {formatDateTime(item.created_at)}
              </span>
            </div>

            {/* Change details if status or priority */}
            {(item.old_value || item.new_value) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600">
                {item.old_value && (
                  <>
                    <span className="line-through text-slate-400 capitalize">
                      {item.old_value.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">→</span>
                  </>
                )}
                {item.new_value && (
                  <span className="font-semibold text-brand-700 capitalize">
                    {item.new_value.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}

            {/* Remarks note */}
            {item.remarks && (
              <p className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                {item.remarks}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
