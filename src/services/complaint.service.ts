import { supabase } from '../lib/supabase';
import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  ComplaintTimeline,
  ComplaintComment,
} from '../types/database.types';

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  building_room?: string;
  is_anonymous: boolean;
  priority?: ComplaintPriority;
  department_id?: string;
  assigned_faculty_id?: string;
  ai_predicted_category?: string;
  ai_predicted_priority?: string;
  ai_summary?: string;
}

export interface ComplaintFilters {
  student_id?: string;
  assigned_faculty_id?: string;
  department_id?: string;
  status?: ComplaintStatus | 'all';
  priority?: ComplaintPriority | 'all';
  category?: ComplaintCategory | 'all';
  searchQuery?: string;
}

export const complaintService = {
  // Upload attachment to Supabase Storage
  async uploadAttachment(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('complaint-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Exception during file upload:', err);
      return null;
    }
  },

  // Create a new complaint
  async createComplaint(
    input: CreateComplaintInput,
    studentId: string,
    files: File[] = []
  ): Promise<{ data: Complaint | null; error: Error | null }> {
    try {
      // 1. Upload any attachments
      const attachmentUrls: string[] = [];
      for (const file of files) {
        const url = await this.uploadAttachment(file);
        if (url) attachmentUrls.push(url);
      }

      // 2. Insert complaint record
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          student_id: studentId,
          title: input.title,
          description: input.description,
          category: input.category,
          location: input.location,
          building_room: input.building_room || null,
          is_anonymous: input.is_anonymous,
          priority: input.priority || 'medium',
          department_id: input.department_id || null,
          assigned_faculty_id: input.assigned_faculty_id || null,
          attachments: attachmentUrls,
          ai_predicted_category: input.ai_predicted_category || null,
          ai_predicted_priority: input.ai_predicted_priority || null,
          ai_summary: input.ai_summary || null,
          status: 'submitted',
        })
        .select('*, department:departments!complaints_department_id_fkey(*)')
        .single();

      if (error) throw error;

      // 3. Insert initial timeline entry
      if (data) {
        await supabase.from('complaint_timeline').insert({
          complaint_id: data.id,
          actor_id: studentId,
          action: 'created',
          remarks: 'Complaint ticket created by student',
        });
      }

      return { data: data as Complaint, error: null };
    } catch (err: any) {
      console.error('Failed to create complaint:', err);
      return { data: null, error: err };
    }
  },

  // Get complaints list with filtering
  async getComplaints(filters: ComplaintFilters = {}): Promise<Complaint[]> {
    let query = supabase
      .from('complaints')
      .select(
        `
        *,
        student:profiles!complaints_student_id_fkey(id, full_name, email, student_id_number),
        department:departments!complaints_department_id_fkey(*),
        assigned_faculty:profiles!complaints_assigned_faculty_id_fkey(id, full_name, email)
      `
      )
      .order('created_at', { ascending: false });

    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }
    if (filters.assigned_faculty_id) {
      query = query.eq('assigned_faculty_id', filters.assigned_faculty_id);
    }
    if (filters.department_id && filters.department_id !== 'all') {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.searchQuery) {
      query = query.or(
        `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,ticket_number.ilike.%${filters.searchQuery}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }

    // Mask student info if anonymous
    const complaints = (data as Complaint[]).map((c) => {
      if (c.is_anonymous) {
        return {
          ...c,
          student: {
            id: '',
            full_name: 'Anonymous Student',
            email: 'hidden@unibridge.local',
            student_id_number: 'Hidden',
          },
        };
      }
      return c;
    });

    return complaints;
  },

  // Get single complaint with full details
  async getComplaintById(id: string, currentUserId?: string): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .select(
        `
        *,
        student:profiles!complaints_student_id_fkey(id, full_name, email, student_id_number),
        department:departments!complaints_department_id_fkey(*),
        assigned_faculty:profiles!complaints_assigned_faculty_id_fkey(id, full_name, email)
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching single complaint:', error);
      return null;
    }

    const complaint = data as Complaint;

    // Mask identity if anonymous and current user is not the creator
    if (complaint.is_anonymous && complaint.student_id !== currentUserId) {
      complaint.student = {
        id: '',
        full_name: 'Anonymous Student',
        email: 'hidden@unibridge.local',
        student_id_number: 'Hidden',
      };
    }

    return complaint;
  },

  // Update complaint status
  async updateStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    remarks: string,
    actorId: string,
    oldStatus?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId);

      if (updateError) throw updateError;

      // Log into timeline
      await supabase.from('complaint_timeline').insert({
        complaint_id: complaintId,
        actor_id: actorId,
        action: 'status_changed',
        old_value: oldStatus,
        new_value: newStatus,
        remarks: remarks || `Status updated to ${newStatus}`,
      });

      // Dual-layer notification guarantee for student
      try {
        const { data: comp } = await supabase
          .from('complaints')
          .select('id, title, ticket_number, student_id')
          .eq('id', complaintId)
          .single();

        if (comp && comp.student_id) {
          const statusLabels: Record<string, string> = {
            submitted: 'Submitted',
            under_review: 'Under Review',
            assigned: 'Assigned',
            in_progress: 'In Progress',
            resolved: 'Resolved',
            rejected: 'Closed',
          };
          const statusName = statusLabels[newStatus] || newStatus;
          await supabase.from('notifications').insert({
            user_id: comp.student_id,
            title: 'Complaint Status Updated',
            message: `Your complaint ${comp.ticket_number || comp.title} is now marked as ${statusName}.`,
            type: 'status_update',
            related_complaint_id: complaintId,
            is_read: false,
          });
        }
      } catch (notifErr) {
        console.warn('[UniBridge] Could not send status notification:', notifErr);
      }

      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      return false;
    }
  },

  // Assign complaint to department and/or faculty
  async assignComplaint(
    complaintId: string,
    departmentId: string | null | undefined,
    facultyId: string | null | undefined,
    actorId: string,
    remarks?: string
  ): Promise<boolean> {
    try {
      const cleanFacultyId = facultyId?.trim() || null;
      const cleanDeptId = departmentId?.trim() || null;

      if (!cleanFacultyId) {
        console.error('[UniBridge] Cannot assign complaint without a valid faculty UUID');
        return false;
      }

      // Prepare payload: updates complaints.assigned_faculty_id with the selected faculty profile UUID.
      // Preserves existing complaint status (does NOT force status change).
      const updatePayload: Record<string, any> = {
        assigned_faculty_id: cleanFacultyId,
        updated_at: new Date().toISOString(),
      };

      if (cleanDeptId) {
        updatePayload.department_id = cleanDeptId;
      }

      const { error } = await supabase
        .from('complaints')
        .update(updatePayload)
        .eq('id', complaintId);

      if (error) {
        console.error('[UniBridge] Error updating complaint assignment in Supabase:', error);
        throw error;
      }

      // Record in complaint timeline (non-blocking)
      try {
        await supabase.from('complaint_timeline').insert({
          complaint_id: complaintId,
          actor_id: actorId,
          action: 'assigned',
          remarks: remarks || 'Assigned to faculty member by administrator',
        });
      } catch (timelineErr) {
        console.warn('[UniBridge] Could not record assignment timeline:', timelineErr);
      }

      // Dual-layer notification guarantee for Faculty assignment and Student notification
      try {
        const { data: comp } = await supabase
          .from('complaints')
          .select('id, title, ticket_number, student_id')
          .eq('id', complaintId)
          .single();

        if (comp) {
          // 1. Notify Assigned Faculty
          await supabase.from('notifications').insert({
            user_id: cleanFacultyId,
            title: 'New Complaint Assigned',
            message: `You have been assigned complaint ${comp.ticket_number || ''}: "${comp.title}".`,
            type: 'assignment',
            related_complaint_id: complaintId,
            is_read: false,
          });

          // 2. Notify Student that complaint was assigned to faculty
          if (comp.student_id) {
            await supabase.from('notifications').insert({
              user_id: comp.student_id,
              title: 'Complaint Assigned to Faculty',
              message: `Your complaint ${comp.ticket_number || comp.title} has been assigned to faculty for investigation.`,
              type: 'assignment',
              related_complaint_id: complaintId,
              is_read: false,
            });
          }
        }
      } catch (notifErr) {
        console.warn('[UniBridge] Could not record assignment notification:', notifErr);
      }

      return true;
    } catch (err) {
      console.error('[UniBridge] Error assigning complaint:', err);
      return false;
    }
  },

  // Update priority
  async updatePriority(
    complaintId: string,
    priority: ComplaintPriority,
    actorId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId);

      if (error) throw error;

      await supabase.from('complaint_timeline').insert({
        complaint_id: complaintId,
        actor_id: actorId,
        action: 'priority_changed',
        new_value: priority,
        remarks: `Priority updated to ${priority}`,
      });

      return true;
    } catch (err) {
      console.error('Error updating priority:', err);
      return false;
    }
  },

  // Timeline entries
  async getTimeline(complaintId: string): Promise<ComplaintTimeline[]> {
    const { data, error } = await supabase
      .from('complaint_timeline')
      .select('*, actor:profiles!complaint_timeline_actor_id_fkey(id, full_name, role)')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching timeline:', error);
      return [];
    }
    return data as ComplaintTimeline[];
  },

  // Comments
  async getComments(complaintId: string): Promise<ComplaintComment[]> {
    const { data, error } = await supabase
      .from('complaint_comments')
      .select('*, author:profiles!complaint_comments_author_id_fkey(id, full_name, role)')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    return data as ComplaintComment[];
  },

  // Add Comment
  async addComment(
    complaintId: string,
    authorId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<ComplaintComment | null> {
    const { data, error } = await supabase
      .from('complaint_comments')
      .insert({
        complaint_id: complaintId,
        author_id: authorId,
        content,
        is_internal: isInternal,
      })
      .select('*, author:profiles!complaint_comments_author_id_fkey(id, full_name, role)')
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }
    return data as ComplaintComment;
  },
};
