import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scores, resultId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format scores for the prompt
    const scoresSummary = Object.entries(scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([category, score]) => `${category.replace(/_/g, " ")}: ${score} points`)
      .join(", ");

    const topCategories = Object.entries(scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category.replace(/_/g, " "));

    const systemPrompt = `You are an expert career counselor specializing in guiding Indian students aged 14-18 years. 
Your role is to provide personalized, encouraging, and actionable career advice based on assessment results.
Focus on careers relevant to the Indian context, including:
- Traditional paths: Engineering (IIT), Medicine (NEET), Civil Services (UPSC), Law, CA/Finance
- Emerging fields: AI/ML, Data Science, UX Design, Content Creation, Entrepreneurship
- Creative careers: Film, Animation, Gaming, Fashion Design

Guidelines:
- Be encouraging and positive
- Provide specific, actionable next steps
- Mention relevant Indian exams and institutions (JEE, NEET, CLAT, NID, NIFT, etc.)
- Consider both traditional and modern career paths
- Include information about required skills and preparation
- Format your response with clear headings and bullet points`;

    const userPrompt = `Based on the career assessment, the student scored: ${scoresSummary}

Their top 3 career categories are: ${topCategories.join(", ")}

Please provide a comprehensive career analysis that includes:

1. **Personality Profile Summary** - A brief overview of their strengths and interests based on scores

2. **Top Career Recommendations** - 3-4 specific career paths that match their profile, with brief descriptions of each

3. **Educational Pathway** - Specific steps for an Indian student:
   - Stream selection after 10th (Science/Commerce/Arts)
   - Key entrance exams to prepare for
   - Top colleges/universities in India for these careers

4. **Skills to Develop** - 4-5 specific skills they should focus on building

5. **Next Steps** - 3-4 actionable items they can start working on immediately

Keep the tone encouraging and age-appropriate for students aged 14-18.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("No analysis content received from AI");
    }

    // Update the result in the database with the AI analysis
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("assessment_results")
      .update({ ai_analysis: analysis })
      .eq("id", resultId);

    if (updateError) {
      console.error("Database update error:", updateError);
      // Don't throw - still return the analysis to the user
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-career function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
