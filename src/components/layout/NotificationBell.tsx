import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { NotificationItem } from '../../types/database.types';
import { supabase } from '../../lib/supabase';
import { formatTimeAgo } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface NotificationBellProps {
  userId?: string;
  role?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, role }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setNotifications(data as NotificationItem[]);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notification inserts
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
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
    return '/notifications';
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    setIsOpen(false);
    if (!n.is_read) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
      } catch (err) {
        console.warn('Failed to mark notification as read:', err);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-100 py-2 z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium bg-pastel-lavender-100 text-brand-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Inbox className="w-8 h-8 stroke-1 text-slate-300" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={getTargetUrl(n)}
                  onClick={() => handleNotificationClick(n)}
                  className={`block p-3.5 transition-colors hover:bg-slate-50 ${
                    !n.is_read ? 'bg-pastel-lavender-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{n.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                </Link>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-2xl">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 block py-1"
            >
              View all notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
