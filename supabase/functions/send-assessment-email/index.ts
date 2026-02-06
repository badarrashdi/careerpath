import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const categoryLabels: Record<string, string> = {
  science_tech: "Technology & Engineering",
  commerce_finance: "Business, Finance & Analytics",
  arts_humanities: "Arts, Humanities & Social Impact",
  creative: "Creative & Design",
  government: "Leadership & Public Service",
  healthcare: "Healthcare & Life Sciences",
};

const renderAnalysisHtml = (analysis: string) => {
  const safeAnalysis = analysis.replace(/\n/g, "<br/>");
  return `<div style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#0f172a;line-height:1.6">${safeAnalysis}</div>`;
};

const renderAnswersHtml = (details: any[]) => {
  const rows = details
    .map((d) => `<tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600">Q${d.id}</td><td style="padding:6px 8px;border:1px solid #e2e8f0">${d.question || ""}</td><td style="padding:6px 8px;border:1px solid #e2e8f0;color:#0f172a">${d.selected || "-"}</td></tr>`)
    .join("");
  return `<table style="border-collapse:collapse;width:100%;margin-top:12px">${rows}</table>`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const {
      userEmail,
      adminEmail,
      aiAnalysis,
      answers,
      answerDetails,
      scores,
      resultId,
      userId,
    } = await req.json();

    if (!userEmail || !adminEmail || !aiAnalysis || !answers) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "CareerPath AI <no-reply@careerpath.ai>";

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sortedCategories = Object.entries(scores || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([id, value]) => ({ id, label: categoryLabels[id] || id, value }));

    const summaryList = sortedCategories
      .map((c) => `<li><strong>${c.label}:</strong> ${c.value?.toFixed ? c.value.toFixed(2) : c.value} pts</li>`)
      .join("");

    const analysisSection = renderAnalysisHtml(aiAnalysis);
    const answersSection = renderAnswersHtml(answerDetails || []);

    const sendEmail = async (to: string, subject: string, html: string) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Email send failed: ${res.status} ${text}`);
      }
    };

    const userHtml = `
      <div style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#0f172a;line-height:1.6">
        <h2 style="margin:0 0 8px 0">Your CareerPath assessment results</h2>
        <p style="margin:0 0 12px 0">Thank you for completing the assessment. Here are your top matches:</p>
        <ul style="padding-left:18px;color:#0f172a">${summaryList}</ul>
        <h3 style="margin:16px 0 8px 0">AI Analysis</h3>
        ${analysisSection}
        <p style="margin-top:16px;color:#475569;font-size:12px">Result ID: ${resultId || "-"}</p>
      </div>
    `;

    const adminHtml = `
      <div style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#0f172a;line-height:1.6">
        <h2 style="margin:0 0 8px 0">Assessment submission</h2>
        <p style="margin:0 0 12px 0">User: ${userEmail} (UID: ${userId || "unknown"})</p>
        <p style="margin:0 0 12px 0">Top matches:</p>
        <ul style="padding-left:18px;color:#0f172a">${summaryList}</ul>
        <h3 style="margin:16px 0 8px 0">AI Analysis</h3>
        ${analysisSection}
        <h3 style="margin:16px 0 8px 0">Answers</h3>
        ${answersSection}
        <p style="margin-top:16px;color:#475569;font-size:12px">Result ID: ${resultId || "-"}</p>
      </div>
    `;

    await sendEmail(userEmail, "Your CareerPath assessment results", userHtml);
    await sendEmail(adminEmail, "New assessment submission", adminHtml);

    return new Response(JSON.stringify({ status: "sent" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-assessment-email error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
