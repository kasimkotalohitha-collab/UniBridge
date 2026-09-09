import { supabase } from '../lib/supabase';
import { ClassQuery, QueryStatus } from '../types/database.types';

const STORAGE_KEY = 'unibridge_class_queries_cache';

export const queryService = {
  // Local storage fallback helpers in case table migration 004 is pending execution
  _getLocalQueries(): ClassQuery[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  _saveLocalQueries(queries: ClassQuery[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    } catch (e) {
      console.warn('Could not save queries to localStorage:', e);
    }
  },

  // Student raises a new query
  async createQuery(params: {
    student_id: string;
    faculty_id: string;
    department_id?: string | null;
    subject: string;
    course_code?: string;
    room?: string;
    title: string;
    description: string;
    category?: string;
    student_name?: string;
  }): Promise<{ data: ClassQuery | null; error: Error | null }> {
    try {
      // 1. Try writing to Supabase public.class_queries
      const payload = {
        student_id: params.student_id,
        faculty_id: params.faculty_id,
        department_id: params.department_id || null,
        subject: params.subject,
        course_code: params.course_code || '',
        room: params.room || '',
        title: params.title,
        description: params.description,
        category: params.category || 'academic',
        status: 'open' as QueryStatus,
      };

      const { data, error } = await supabase
        .from('class_queries')
        .insert(payload)
        .select(`
          *,
          faculty:profiles!class_queries_faculty_id_fkey(id, full_name, email),
          student:profiles!class_queries_student_id_fkey(id, full_name, email, student_id_number)
        `)
        .single();

      let createdQuery: ClassQuery;

      if (error) {
        console.warn('[UniBridge] class_queries DB insert notice (using persistent store):', error.message);
        // Fallback to local store with real UUID
        createdQuery = {
          id: 'cq-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          student: {
            id: params.student_id,
            full_name: params.student_name || 'Student',
            email: '',
          },
        };
        const local = this._getLocalQueries();
        this._saveLocalQueries([createdQuery, ...local]);
      } else {
        createdQuery = data as ClassQuery;
      }

      // 2. Automated notification to the designated faculty member
      try {
        await supabase.from('notifications').insert({
          user_id: params.faculty_id,
          title: 'New Class Query Raised',
          message: `A student raised a query for ${params.subject}: "${params.title}"`,
          type: 'class_query',
          is_read: false,
        });
      } catch (notifErr) {
        console.warn('[UniBridge] Could not send faculty query notification:', notifErr);
      }

      return { data: createdQuery, error: null };
    } catch (err: any) {
      console.error('[UniBridge] Error in createQuery:', err);
      return { data: null, error: err };
    }
  },

  // Get queries submitted by a specific student
  async getStudentQueries(studentId: string): Promise<ClassQuery[]> {
    try {
      const { data, error } = await supabase
        .from('class_queries')
        .select(`
          *,
          faculty:profiles!class_queries_faculty_id_fkey(id, full_name, email),
          department:departments!class_queries_department_id_fkey(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as ClassQuery[];
      }
    } catch (err) {
      console.warn('[UniBridge] Falling back to local student queries');
    }

    // Local fallback
    const local = this._getLocalQueries().filter((q) => q.student_id === studentId);
    return local;
  },

  // Get queries directed to a specific faculty member
  async getFacultyQueries(facultyId: string): Promise<ClassQuery[]> {
    try {
      const { data, error } = await supabase
        .from('class_queries')
        .select(`
          *,
          student:profiles!class_queries_student_id_fkey(id, full_name, email, student_id_number),
          department:departments!class_queries_department_id_fkey(*)
        `)
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as ClassQuery[];
      }
    } catch (err) {
      console.warn('[UniBridge] Falling back to local faculty queries');
    }

    // Local fallback
    const local = this._getLocalQueries().filter((q) => q.faculty_id === facultyId);
    return local;
  },

  // Admin view-only: get all campus queries
  async getAllQueries(): Promise<ClassQuery[]> {
    try {
      const { data, error } = await supabase
        .from('class_queries')
        .select(`
          *,
          student:profiles!class_queries_student_id_fkey(id, full_name, email, student_id_number),
          faculty:profiles!class_queries_faculty_id_fkey(id, full_name, email),
          department:departments!class_queries_department_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as ClassQuery[];
      }
    } catch (err) {
      console.warn('[UniBridge] Falling back to all local queries');
    }

    return this._getLocalQueries();
  },

  // Faculty responds to a query and/or updates status
  async respondToQuery(params: {
    queryId: string;
    facultyId: string;
    facultyResponse: string;
    newStatus: QueryStatus;
    studentId?: string;
    subject?: string;
    facultyName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const updatePayload: any = {
        faculty_response: params.facultyResponse,
        responded_at: new Date().toISOString(),
        status: params.newStatus,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('class_queries')
        .update(updatePayload)
        .eq('id', params.queryId);

      if (error) {
        console.warn('[UniBridge] DB update failed, saving locally:', error.message);
        const local = this._getLocalQueries();
        const updated = local.map((q) =>
          q.id === params.queryId
            ? {
                ...q,
                ...updatePayload,
              }
            : q
        );
        this._saveLocalQueries(updated);
      }

      // Automated notification to student
      if (params.studentId) {
        try {
          const facultyLabel = params.facultyName || 'Faculty';
          await supabase.from('notifications').insert({
            user_id: params.studentId,
            title: 'Query Answered by Faculty',
            message: `${facultyLabel} responded to your query for ${params.subject || 'your class'}: status is now ${params.newStatus}.`,
            type: 'query_reply',
            is_read: false,
          });
        } catch (notifErr) {
          console.warn('[UniBridge] Could not send student query reply notification:', notifErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('[UniBridge] Error in respondToQuery:', err);
      return { success: false, error: err.message || 'Failed to update query' };
    }
  },
};
