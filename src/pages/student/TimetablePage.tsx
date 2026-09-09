import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  timetableService,
  TimetableEntry,
  DAYS_OF_WEEK,
  DayOfWeek,
} from '../../services/timetable.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RaiseQueryModal } from '../../components/queries/RaiseQueryModal';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  ChevronRight,
  Layers,
  CalendarDays,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedClassForQuery, setSelectedClassForQuery] = useState<TimetableEntry | null>(null);

  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
    currentTime
  ) as DayOfWeek;

  useEffect(() => {
    timetableService.getTimetable().then((data) => {
      setTimetable(data);
      // Default to current weekday if Monday - Saturday
      if (DAYS_OF_WEEK.includes(todayName)) {
        setSelectedDay(todayName);
      }
    });

    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const getClassStatus = (entry: TimetableEntry) => {
    if (entry.day !== todayName) return null;
    const startMins = entry.startHour * 60 + entry.startMinute;
    const endMins = entry.endHour * 60 + entry.endMinute;

    if (currentMinutes >= startMins && currentMinutes <= endMins) {
      return 'in_progress';
    } else if (currentMinutes < startMins && startMins - currentMinutes <= 60) {
      return 'upcoming';
    }
    return null;
  };

  const selectedDayClasses = timetable.filter((c) => c.day === selectedDay);
  const todayClasses = timetable.filter((c) => c.day === todayName);
  const activeClass = todayClasses.find((c) => getClassStatus(c) === 'in_progress');
  const nextClass = todayClasses.find((c) => getClassStatus(c) === 'upcoming');

  const getTypeBadgeVariant = (type: TimetableEntry['type']) => {
    switch (type) {
      case 'Lecture':
        return 'purple' as const;
      case 'Lab':
        return 'success' as const;
      case 'Tutorial':
        return 'default' as const;
      case 'Seminar':
        return 'warning' as const;
      default:
        return 'slate' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pastel-lavender-100 via-white to-pastel-pink-100 rounded-3xl p-6 sm:p-8 border border-pastel-lavender-200/70 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-pastel-lavender-200 text-brand-700 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>Academic Schedule • Fall Semester 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Class Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Live campus lecture schedules, laboratory sessions, assigned faculty, and room allocations.
          </p>
        </div>

        {/* Action button & View mode toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/student/queries">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 border-pastel-lavender-200 text-brand-700 hover:bg-pastel-lavender-50 shadow-xs"
              leftIcon={<HelpCircle className="w-4 h-4 text-brand-600" />}
            >
              My Raised Queries
            </Button>
          </Link>

          <div className="flex items-center bg-white/80 p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all',
                viewMode === 'day'
                  ? 'bg-pastel-lavender-100 text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Day View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all',
                viewMode === 'week'
                  ? 'bg-pastel-lavender-100 text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Weekly Grid
            </button>
          </div>
        </div>
      </div>

      {/* Live Class Indicator if any */}
      {activeClass && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Class Happening Right Now
              </span>
              <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                {activeClass.subject} ({activeClass.courseCode})
              </h4>
              <p className="text-xs text-emerald-800 flex items-center gap-2 mt-0.5">
                <span>{activeClass.startTime} - {activeClass.endTime}</span>
                <span>•</span>
                <span>{activeClass.room}, {activeClass.building}</span>
                <span>•</span>
                <span>{activeClass.faculty}</span>
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            In Session
          </Badge>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="space-y-6">
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = day === todayName;
              const classCount = timetable.filter((c) => c.day === day).length;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'flex flex-col items-start px-4 py-2.5 rounded-2xl border transition-all shrink-0 select-none min-w-[110px]',
                    isSelected
                      ? 'bg-pastel-lavender-100 border-brand-300 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isSelected ? 'text-brand-800' : 'text-slate-800'
                      )}
                    >
                      {day.slice(0, 3)}
                    </span>
                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-brand-500" title="Today" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[11px] mt-0.5',
                      isSelected ? 'text-brand-600 font-medium' : 'text-slate-400'
                    )}
                  >
                    {classCount} {classCount === 1 ? 'class' : 'classes'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Schedule List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{selectedDay} Schedule</span>
                {selectedDay === todayName && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                    Today
                  </span>
                )}
              </h3>
              <span className="text-xs text-slate-400">
                {selectedDayClasses.length} Scheduled Sessions
              </span>
            </div>

            {selectedDayClasses.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No classes scheduled</p>
                <p className="text-xs text-slate-400 mt-0.5">Enjoy your free study or rest time!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {selectedDayClasses.map((item) => {
                  const status = getClassStatus(item);
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        'p-5 transition-all duration-150',
                        status === 'in_progress' &&
                          'ring-2 ring-emerald-500/40 bg-emerald-50/20 border-emerald-200'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                              {item.courseCode}
                            </span>
                            <Badge variant={getTypeBadgeVariant(item.type)} size="sm">
                              {item.type}
                            </Badge>
                            {status === 'in_progress' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 animate-pulse">
                                Happening Now
                              </span>
                            )}
                            {status === 'upcoming' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                                Starts Soon
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {item.subject}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {item.faculty}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.room}, {item.building}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-2.5">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                              <Clock className="w-4 h-4 text-brand-600" />
                              <span>{item.startTime}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 block">until {item.endTime}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => setSelectedClassForQuery(item)}
                            className="border-brand-200 bg-brand-50/60 text-brand-700 hover:bg-brand-100/70 shadow-2xs text-xs py-1 px-3"
                            leftIcon={<HelpCircle className="w-3.5 h-3.5 text-brand-600" />}
                          >
                            Raise a Query
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Grid View */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayItems = timetable.filter((c) => c.day === day);
              const isToday = day === todayName;

              return (
                <Card
                  key={day}
                  className={cn(
                    'p-4 space-y-3',
                    isToday && 'ring-2 ring-brand-500/30 border-brand-200 bg-brand-50/10'
                  )}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {day}
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                          Today
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      {dayItems.length} {dayItems.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  {dayItems.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center">
                      No scheduled sessions
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dayItems.map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 truncate max-w-[150px]">
                              {c.subject}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {c.startTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{c.room}</span>
                            <span className="text-slate-400 truncate max-w-[120px]">
                              {c.faculty.split(' ')[0]} {c.faculty.split(' ')[1]}
                            </span>
                          </div>
                          <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setSelectedClassForQuery(c)}
                              className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
                            >
                              <HelpCircle className="w-3 h-3" />
                              Raise Query
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Raise Query Modal */}
      <RaiseQueryModal
        isOpen={!!selectedClassForQuery}
        onClose={() => setSelectedClassForQuery(null)}
        classEntry={selectedClassForQuery}
      />
    </div>
  );
};
