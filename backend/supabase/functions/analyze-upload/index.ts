import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const domain = (formData.get("domain") as string) || "general";
    const userId = formData.get("userId") as string;

    if (!file || !userId) throw new Error("Missing file or userId");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("report-uploads")
      .upload(filePath, fileBuffer, { contentType: file.type });

    if (uploadError) throw uploadError;

    const isImage = file.type.startsWith("image/");

    const basePrompt = `
Return ONLY valid JSON matching this schema, no markdown, no commentary:
{
  "summary": string,
  "metrics": [{"label": string, "value": string, "trend": "up|down|flat"}],
  "charts": [{"type": "bar|line|pie", "title": string, "data": [{"name": string, "value": number}]}],
  "anomalies": [{"description": string, "severity": "low|medium|high"}]
}

Data domain: ${domain}
`;

    let contentParts;

    if (isImage) {
      const base64Image = bufferToBase64(fileBuffer);
      contentParts = [
        { text: basePrompt + "\nThe data is a screenshot of a dashboard or chart. Read the visible numbers, labels, and trends from the image itself." },
        { inline_data: { mime_type: file.type, data: base64Image } },
      ];
    } else {
      const textContent = new TextDecoder().decode(fileBuffer);
      contentParts = [
        { text: basePrompt + `\nData:\n${textContent}` },
      ];
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: {
            maxOutputTokens: 3000,
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

    function cleanAndParse(text: string) {
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    }

    let parsed;
    try {
      parsed = cleanAndParse(rawText);
    } catch {
      const retryRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: basePrompt + "\n\nYour last response was not valid JSON. Return ONLY the JSON object, nothing else, no markdown." }] }],
            generationConfig: {
              maxOutputTokens: 3000,
              thinkingConfig: { thinkingLevel: "low" },
            },
          }),
        }
      );
      const retryData = await retryRes.json();
      const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      parsed = cleanAndParse(retryText);
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: userId,
        domain,
        source_file_url: filePath,
        summary: parsed.summary,
        metrics: parsed.metrics,
        charts: parsed.charts,
        anomalies: parsed.anomalies,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});