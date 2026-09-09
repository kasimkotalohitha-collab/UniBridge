import { ComplaintCategory, ComplaintPriority } from '../types/database.types';
import { supabase } from '../lib/supabase';

export interface AIComplaintAnalysis {
  predictedCategory: ComplaintCategory;
  predictedPriority: ComplaintPriority;
  summary: string;
  reasoning: string;
  suggestedDepartmentCode: string;
  confidenceScore: number;
}

export const aiService = {
  async analyzeComplaint(
    title: string,
    description: string
  ): Promise<AIComplaintAnalysis> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'analyze-complaint',
        {
          body: {
            title,
            description,
          },
        }
      );

      if (!error && data && !data.error) {
        return {
          predictedCategory: data.predictedCategory || 'other',
          predictedPriority: data.predictedPriority || 'medium',
          summary: data.summary || title,
          reasoning:
            data.reasoning ||
            'Derived from contextual language analysis.',
          suggestedDepartmentCode:
            data.suggestedDepartmentCode || 'ESTATE',
          confidenceScore: data.confidenceScore || 0.85,
        };
      }

      console.warn(
        '[UniBridge AI] Supabase Edge Function failed. Using local fallback:',
        error || data?.error
      );
    } catch (err) {
      console.warn(
        '[UniBridge AI] Edge Function unavailable. Using local fallback:',
        err
      );
    }

    return this.fallbackAnalysis(title, description);
  },

  fallbackAnalysis(
    title: string,
    description: string
  ): AIComplaintAnalysis {
    const text = `${title} ${description}`.toLowerCase();

    let predictedPriority: ComplaintPriority = 'medium';
    let priorityReason = 'Standard campus service issue.';

    if (
      text.includes('fire') ||
      text.includes('smoke') ||
      text.includes('short circuit') ||
      text.includes('spark') ||
      text.includes('electric shock') ||
      text.includes('gas leak') ||
      text.includes('flood') ||
      text.includes('collapse') ||
      text.includes('urgent') ||
      text.includes('danger')
    ) {
      predictedPriority = 'urgent';
      priorityReason =
        'Urgent: Safety hazard or immediate risk detected in submission.';
    } else if (
      text.includes('exam') ||
      text.includes('hall ticket') ||
      text.includes('leak') ||
      text.includes('broken ac') ||
      text.includes('power cut') ||
      text.includes('water supply') ||
      text.includes('blackout')
    ) {
      predictedPriority = 'high';
      priorityReason =
        'High: Significant disruption to student daily study or living conditions.';
    } else if (
      text.includes('light flicker') ||
      text.includes('cleanliness') ||
      text.includes('dust') ||
      text.includes('chair') ||
      text.includes('table')
    ) {
      predictedPriority = 'low';
      priorityReason =
        'Low: Routine aesthetic or non-blocking maintenance.';
    }

    let predictedCategory: ComplaintCategory = 'infrastructure';
    let suggestedDepartmentCode = 'ESTATE';

    if (
      text.includes('wifi') ||
      text.includes('wi-fi') ||
      text.includes('internet') ||
      text.includes('lms') ||
      text.includes('portal') ||
      text.includes('login') ||
      text.includes('network') ||
      text.includes('computer')
    ) {
      predictedCategory = 'it_services';
      suggestedDepartmentCode = 'IT_SERV';
    } else if (
      text.includes('room') ||
      text.includes('hostel') ||
      text.includes('warden') ||
      text.includes('bed') ||
      text.includes('dorm') ||
      text.includes('washroom')
    ) {
      predictedCategory = 'hostel';
      suggestedDepartmentCode = 'HOSTEL';
    } else if (
      text.includes('exam') ||
      text.includes('grade') ||
      text.includes('marks') ||
      text.includes('professor') ||
      text.includes('lecture') ||
      text.includes('course') ||
      text.includes('timetable')
    ) {
      predictedCategory = 'academic';
      suggestedDepartmentCode = 'ACAD';
    } else if (
      text.includes('food') ||
      text.includes('mess') ||
      text.includes('canteen') ||
      text.includes('cafeteria') ||
      text.includes('meal') ||
      text.includes('hygiene')
    ) {
      predictedCategory = 'cafeteria';
      suggestedDepartmentCode = 'DINING';
    } else if (
      text.includes('bus') ||
      text.includes('shuttle') ||
      text.includes('parking') ||
      text.includes('driver') ||
      text.includes('cab')
    ) {
      predictedCategory = 'transport';
      suggestedDepartmentCode = 'TRANS';
    } else if (
      text.includes('book') ||
      text.includes('library') ||
      text.includes('journal') ||
      text.includes('reading room')
    ) {
      predictedCategory = 'library';
      suggestedDepartmentCode = 'LIB';
    } else if (
      text.includes('gym') ||
      text.includes('sports') ||
      text.includes('court') ||
      text.includes('ground') ||
      text.includes('ball')
    ) {
      predictedCategory = 'sports';
      suggestedDepartmentCode = 'SPORTS';
    }

    const summary =
      title.length > 80 ? `${title.substring(0, 77)}...` : title;

    return {
      predictedCategory,
      predictedPriority,
      summary,
      reasoning: priorityReason,
      suggestedDepartmentCode,
      confidenceScore: 0.82,
    };
  },
};