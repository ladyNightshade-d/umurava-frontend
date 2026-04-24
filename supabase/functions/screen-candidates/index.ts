import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { job_description, required_skills, experience_level, top_performer_profile, weight_skills, weight_experience, weight_culture, candidates } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const results = [];

    for (const candidate of candidates) {
      const prompt = `You are an AI recruitment assistant for HireWise AI.

Job Description: ${job_description}
Required Skills: ${(required_skills || []).join(", ")}
Experience Level: ${experience_level}
Top Performer Profile: ${top_performer_profile || "Not specified"}

Scoring Weights:
- Skills Match: ${weight_skills}%
- Experience: ${weight_experience}%
- Culture Fit: ${weight_culture}%

Candidate Resume:
${candidate.resume_text}

Candidate Listed Skills: ${(candidate.skills || []).join(", ")}

Tasks:
1. Evaluate candidate fit for the job based on the scoring weights
2. Identify strengths and gaps
3. Assess culture fit (High, Medium, or Low) based on the top performer profile
4. Extract top skills and generate skill tags
5. Generate 2-3 targeted interview questions addressing gaps or risks
6. Provide a final ranking score (0-100) weighted according to the specified weights

You must respond with ONLY valid JSON matching this exact structure:
{
  "final_score": <number 0-100>,
  "strengths": [<string>, ...],
  "gaps": [<string>, ...],
  "culture_fit": "<High|Medium|Low>",
  "skill_tags": [<string>, ...],
  "interview_questions": [<string>, ...]
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a precise AI recruitment evaluator. Always respond with valid JSON only, no markdown formatting." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds to your workspace." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!response.ok) {
        console.error("AI gateway error:", response.status, await response.text());
        throw new Error("AI gateway error");
      }

      const aiData = await response.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      
      // Strip markdown code fences if present
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const parsed = JSON.parse(content);
        results.push({
          candidate_id: candidate.id,
          final_score: Math.min(100, Math.max(0, parsed.final_score || 0)),
          strengths: parsed.strengths || [],
          gaps: parsed.gaps || [],
          culture_fit: parsed.culture_fit || "Medium",
          skill_tags: parsed.skill_tags || [],
          interview_questions: parsed.interview_questions || [],
        });
      } catch {
        console.error("Failed to parse AI response for candidate", candidate.id, content);
        results.push({
          candidate_id: candidate.id,
          final_score: 50,
          strengths: ["Could not fully evaluate"],
          gaps: ["AI evaluation incomplete"],
          culture_fit: "Medium",
          skill_tags: candidate.skills || [],
          interview_questions: ["Tell me about your most impactful project."],
        });
      }

      // Small delay between candidates to avoid rate limiting
      if (candidates.indexOf(candidate) < candidates.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("screen-candidates error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
