import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const { reportId, question } = await req.json();

    if (!reportId || !question) {
      throw new Error("Missing reportId or question");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("summary, metrics, charts, anomalies")
      .eq("id", reportId)
      .single();

    if (fetchError) throw fetchError;

    const prompt = `
You have this existing business report data:
${JSON.stringify(report)}

The user asks: "${question}"

Answer the question using only this data. Return ONLY valid JSON, no markdown, no commentary:
{
  "answer": string,
  "chart_update": { "type": "bar|line|pie", "title": string, "data": [{"name": string, "value": number}] } or null
}
    `;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2000,
            thinkingConfig: { thinkingLevel: "low" },
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      throw new Error("Gemini returned empty response: " + JSON.stringify(geminiData));
    }

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    await supabase.from("report_messages").insert([
      { report_id: reportId, role: "user", content: question },
      { report_id: reportId, role: "assistant", content: parsed.answer, chart_update: parsed.chart_update },
    ]);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});