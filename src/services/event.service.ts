import { supabase } from '../lib/supabase';
import { CampusEvent } from '../types/database.types';

export const eventService = {
  async getEvents(): Promise<CampusEvent[]> {
    const { data, error } = await supabase
      .from('campus_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching campus events:', error);
      return [];
    }
    return data as CampusEvent[];
  },

  async createEvent(event: {
    title: string;
    description: string;
    organizer: string;
    location: string;
    event_date: string;
    category: string;
    created_by?: string;
  }): Promise<CampusEvent | null> {
    const { data, error } = await supabase
      .from('campus_events')
      .insert(event)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating campus event:', error);
      return null;
    }
    return data as CampusEvent;
  },
};
