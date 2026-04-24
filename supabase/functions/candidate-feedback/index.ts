import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { application_id, job_id, user_id } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch application and job data
    const [appRes, jobRes] = await Promise.all([
      supabase.from("applications").select("*").eq("id", application_id).single(),
      supabase.from("jobs").select("*").eq("id", job_id).single(),
    ]);

    if (appRes.error || !appRes.data) throw new Error("Application not found");
    if (jobRes.error || !jobRes.data) throw new Error("Job not found");

    const app = appRes.data;
    const job = jobRes.data;

    const prompt = `You are an AI career coach for HireWise AI's candidate feedback system.

Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${(job.required_skills || []).join(", ")}
Experience Level: ${job.experience_level}
Top Performer Profile: ${job.top_performer_profile || "Not specified"}

Candidate's Resume/Experience:
${app.resume_text}

Candidate's Listed Skills: ${(app.skills || []).join(", ")}

Tasks:
1. Evaluate the candidate's fit for this specific role (score 0-100)
2. List 3-5 specific strengths the candidate demonstrated
3. List 3-5 specific gaps or areas where the candidate fell short
4. Assess culture fit (High, Medium, or Low)
5. Provide 3-5 actionable improvement tips — specific courses, skills to learn, or experiences to gain
6. Write a clear, empathetic explanation of why the candidate was or wasn't a strong fit (2-3 sentences)

Be constructive, specific, and encouraging. Focus on growth.

Respond with ONLY valid JSON:
{
  "final_score": <number 0-100>,
  "strengths": [<string>, ...],
  "gaps": [<string>, ...],
  "culture_fit": "<High|Medium|Low>",
  "improvement_tips": [<string>, ...],
  "status_reason": "<string explaining the decision>"
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
          { role: "system", content: "You are a constructive AI career coach. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) throw new Error("AI gateway error");

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        final_score: 50,
        strengths: ["Could not fully evaluate"],
        gaps: ["AI evaluation incomplete"],
        culture_fit: "Medium",
        improvement_tips: ["Try applying again with a more detailed resume"],
        status_reason: "We couldn't complete a full evaluation at this time.",
      };
    }

    // Save feedback
    const { error: insertError } = await supabase.from("candidate_feedback").insert({
      application_id,
      user_id,
      job_id,
      final_score: Math.min(100, Math.max(0, parsed.final_score || 0)),
      strengths: parsed.strengths || [],
      gaps: parsed.gaps || [],
      culture_fit: parsed.culture_fit || "Medium",
      improvement_tips: parsed.improvement_tips || [],
      status_reason: parsed.status_reason || "",
    });

    if (insertError) throw insertError;

    // Update application status to reviewed
    await supabase.from("applications").update({ status: "reviewed" }).eq("id", application_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("candidate-feedback error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
