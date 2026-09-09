import React from 'react';
import { CampusEvent } from '../../types/database.types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDateTime } from '../../lib/utils';
import { Calendar, MapPin, Users } from 'lucide-react';

export const EventCard: React.FC<{ event: CampusEvent }> = ({ event }) => {
  return (
    <Card hoverable className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="purple" size="sm">
            {event.category}
          </Badge>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            {formatDateTime(event.event_date)}
          </span>
        </div>

        <h4 className="text-base font-semibold text-slate-900 line-clamp-1">
          {event.title}
        </h4>
        <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 truncate max-w-[140px]">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{event.location}</span>
        </span>
        <span className="flex items-center gap-1.5 truncate max-w-[140px]">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{event.organizer}</span>
        </span>
      </div>
    </Card>
  );
};
