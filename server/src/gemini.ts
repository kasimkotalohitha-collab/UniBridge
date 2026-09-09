import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AnalysisOutput {
  predictedCategory: string;
  predictedPriority: string;
  summary: string;
  reasoning: string;
  suggestedDepartmentCode: string;
  confidenceScore: number;
}

export async function analyzeComplaintWithGemini(
  title: string,
  description: string
): Promise<AnalysisOutput> {
  if (!genAI || !apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are an expert university campus operations assistant for UniBridge.
Analyze the following student complaint and classify it accurately:

Title: "${title}"
Description: "${description}"

Categories to choose from strictly:
- "hostel" (Hostel, dorm, washroom, bed, roommate noise, warden affairs)
- "academic" (Courses, exams, professor disputes, attendance, curriculum)
- "infrastructure" (Electrical, plumbing, broken AC, bench, projector, doors, campus grounds)
- "cafeteria" (Food hygiene, mess food quality, pricing, canteen)
- "sports" (Gym equipment, badminton court, fields)
- "transport" (Bus routes, campus shuttle, parking)
- "library" (Book availability, study room noise, digital access)
- "it_services" (Wi-Fi network, student portal, LMS, computer lab)
- "other" (Any miscellaneous issue)

Priorities to choose from strictly:
- "urgent" (Safety hazard, fire/smoke risk, electric shock hazard, gas leak, active flooding)
- "high" (Significant ongoing disruption: exam conflict, broken AC in exam hall, total water outage)
- "medium" (Standard service defect: non-critical fixture broken, Wi-Fi slow in one corner)
- "low" (Minor aesthetic or routine request: loose door handle, scuff marks)

Department codes to choose from:
- "ESTATE" (Campus Infrastructure)
- "IT_SERV" (IT & Network Services)
- "HOSTEL" (Hostel & Residential Life)
- "ACAD" (Academic Affairs)
- "DINING" (Dining & Food Services)
- "TRANS" (Transport & Logistics)
- "SPORTS" (Sports & Gymnasium)
- "LIB" (Central Library)

Respond ONLY with a valid JSON object matching:
{
  "predictedCategory": "category_string",
  "predictedPriority": "priority_string",
  "summary": "One concise sentence summarizing the grievance",
  "reasoning": "Clear explanation of why this priority and category were selected",
  "suggestedDepartmentCode": "dept_code_string",
  "confidenceScore": 0.95
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text() || '{}';
  return JSON.parse(text) as AnalysisOutput;
}
