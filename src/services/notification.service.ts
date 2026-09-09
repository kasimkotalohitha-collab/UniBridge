import { supabase } from '../lib/supabase';
import { NotificationItem } from '../types/database.types';

export const notificationService = {
  // Fetch notifications for a specific user ordered latest first
  async getNotifications(userId: string, limit = 50): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[UniBridge] Error fetching notifications:', error);
        return [];
      }
      return (data || []) as NotificationItem[];
    } catch (err) {
      console.error('[UniBridge] Error in getNotifications:', err);
      return [];
    }
  },

  // Mark a single notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('[UniBridge] Error marking notification as read:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[UniBridge] Error in markAsRead:', err);
      return false;
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('[UniBridge] Error marking all notifications as read:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[UniBridge] Error in markAllAsRead:', err);
      return false;
    }
  },

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('[UniBridge] Error deleting notification:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[UniBridge] Error in deleteNotification:', err);
      return false;
    }
  },

  // Create a notification
  async createNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type?: string;
    related_complaint_id?: string | null;
  }): Promise<NotificationItem | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'system',
          related_complaint_id: notification.related_complaint_id || null,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.warn('[UniBridge] Error creating notification:', error);
        return null;
      }
      return data as NotificationItem;
    } catch (err) {
      console.warn('[UniBridge] Error in createNotification:', err);
      return null;
    }
  },
};
