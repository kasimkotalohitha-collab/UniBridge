import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notification.service';
import { NotificationItem } from '../../types/database.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { supabase } from '../../lib/supabase';
import { formatTimeAgo } from '../../lib/utils';
import {
  Bell,
  CheckCheck,
  Trash2,
  Inbox,
  Filter,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const data = await notificationService.getNotifications(user.id, 100);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Real-time listener for incoming notifications
    const channel = supabase
      .channel(`user-notifications-page-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setActionLoading(true);
    await notificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setActionLoading(false);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTargetUrl = (notification: NotificationItem) => {
    if (
      notification.type === 'class_query' ||
      notification.type === 'query_reply' ||
      notification.type === 'query_status'
    ) {
      if (role === 'faculty') return '/faculty/queries';
      if (role === 'admin') return '/admin/queries';
      return '/student/queries';
    }
    if (notification.related_complaint_id) {
      if (role === 'admin') return `/admin/complaints/${notification.related_complaint_id}`;
      if (role === 'faculty') return `/faculty/complaints/${notification.related_complaint_id}`;
      return `/student/complaints/${notification.related_complaint_id}`;
    }
    return '#';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'class_query':
      case 'query_reply':
      case 'query_status':
        return <HelpCircle className="w-4 h-4 text-emerald-600" />;
      case 'status_update':
      case 'complaint_status':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.is_read : true
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time campus alerts for complaint assignments, status updates, and class queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
              leftIcon={<CheckCheck className="w-4 h-4 text-brand-600" />}
            >
              Mark all as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'all'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === 'unread' ? 'bg-white text-brand-700 font-bold' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500">Loading your notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {filter === 'unread'
                  ? 'You are all caught up! No unread notifications.'
                  : 'You do not have any notifications at the moment.'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notification) => {
            const targetUrl = getTargetUrl(notification);
            const isClickable = targetUrl !== '#';

            return (
              <Card
                key={notification.id}
                className={`p-4 transition-all duration-150 ${
                  !notification.is_read
                    ? 'border-brand-200 bg-brand-50/20 shadow-xs'
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <Badge variant="purple" size="sm">
                            New
                          </Badge>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
                        {notification.message}
                      </p>

                      {isClickable && (
                        <div className="mt-2.5">
                          <Link
                            to={targetUrl}
                            onClick={(e) => {
                              if (!notification.is_read) {
                                handleMarkAsRead(notification.id, e);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 group"
                          >
                            <span>View details</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(notification.id, e)}
                      title="Delete notification"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
