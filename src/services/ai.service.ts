import { ComplaintCategory, ComplaintPriority } from '../types/database.types';

export interface AIComplaintAnalysis {
  predictedCategory: ComplaintCategory;
  predictedPriority: ComplaintPriority;
  summary: string;
  reasoning: string;
  suggestedDepartmentCode: string;
  confidenceScore: number;
}

export const aiService = {
  // Analyzes complaint title and description securely
  async analyzeComplaint(
    title: string,
    description: string
  ): Promise<AIComplaintAnalysis> {
    const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;

    // 1. Attempt secure server-side Gemini request if proxy is available
    if (proxyUrl) {
      try {
        const response = await fetch(`${proxyUrl}/analyze-complaint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description }),
        });

        if (response.ok) {
          const result = await response.json();
          return {
            predictedCategory: result.predictedCategory || 'other',
            predictedPriority: result.predictedPriority || 'medium',
            summary: result.summary || title,
            reasoning: result.reasoning || 'Derived from contextual language analysis.',
            suggestedDepartmentCode: result.suggestedDepartmentCode || 'ESTATE',
            confidenceScore: result.confidenceScore || 0.85,
          };
        }
      } catch (networkErr) {
        console.warn(
          '[UniBridge AI] Server proxy not reached. Falling back to local heuristic analysis:',
          networkErr
        );
      }
    }

    // 2. Intelligent explainable heuristic engine fallback (keeps UI functional without offline breaks)
    return this.fallbackAnalysis(title, description);
  },

  // Rule-based explainable fallback when Gemini server proxy is offline
  fallbackAnalysis(title: string, description: string): AIComplaintAnalysis {
    const text = `${title} ${description}`.toLowerCase();

    // Priority Detection
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
      priorityReason = 'Urgent: Safety hazard or immediate risk detected in submission.';
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
      priorityReason = 'High: Significant disruption to student daily study or living conditions.';
    } else if (
      text.includes('light flicker') ||
      text.includes('cleanliness') ||
      text.includes('dust') ||
      text.includes('chair') ||
      text.includes('table')
    ) {
      predictedPriority = 'low';
      priorityReason = 'Low: Routine aesthetic or non-blocking maintenance.';
    }

    // Category Detection
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

    // Executive summary (first sentence or capped string)
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
