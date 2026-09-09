import { supabase } from '../lib/supabase';
import { Department, Profile } from '../types/database.types';

export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        console.warn('[UniBridge] Error fetching departments from Supabase:', error.message);
        return [];
      }
      return (data as Department[]) || [];
    } catch (err) {
      console.error('[UniBridge] Exception in getDepartments:', err);
      return [];
    }
  },

  async getFacultyMembers(departmentId?: string, _departmentCode?: string): Promise<Profile[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('*, department:departments!profiles_department_id_fkey(*)')
        .eq('role', 'faculty')
        .order('full_name');

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[UniBridge] Error fetching faculty members from profiles:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data as Profile[];
      }

      // If no faculty registered in this specific department, return all registered faculty
      // across all departments so the administrator is not blocked from assigning
      if (departmentId) {
        const { data: allFaculty, error: allErr } = await supabase
          .from('profiles')
          .select('*, department:departments!profiles_department_id_fkey(*)')
          .eq('role', 'faculty')
          .order('full_name');

        if (!allErr && allFaculty && allFaculty.length > 0) {
          return allFaculty as Profile[];
        }
      }

      return [];
    } catch (err) {
      console.error('[UniBridge] Exception fetching faculty members:', err);
      return [];
    }
  },
};
