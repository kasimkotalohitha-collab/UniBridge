// Supabase Edge Function: analyze-complaint
// Deploy with: supabase functions deploy analyze-complaint --no-verify-jwt
// Set secret: supabase secrets set GEMINI_API_KEY="your-gemini-key"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY secret is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
You are an expert university campus operations assistant for UniBridge.
Analyze the following student complaint and classify it accurately:

Title: "${title}"
Description: "${description}"

Categories: "hostel", "academic", "infrastructure", "cafeteria", "sports", "transport", "library", "it_services", "other"
Priorities: "urgent", "high", "medium", "low"
Department codes: "ESTATE", "IT_SERV", "HOSTEL", "ACAD", "DINING", "TRANS", "SPORTS", "LIB"

Respond ONLY with valid JSON:
{
  "predictedCategory": "category",
  "predictedPriority": "priority",
  "summary": "one sentence summary",
  "reasoning": "brief explanation",
  "suggestedDepartmentCode": "code",
  "confidenceScore": 0.95
}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(textContent);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
