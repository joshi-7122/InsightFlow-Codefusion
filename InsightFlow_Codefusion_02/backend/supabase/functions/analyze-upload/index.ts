import { ANALYZE_PROMPT } from "../_shared/prompts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function cleanJSON(input: string): string {
  let cleaned = input.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { rawText = "", filePayloads = [], domain = "general", title = "Dataset Analysis" } = body;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY secret is not configured in Supabase." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process file payloads if provided
    let processedRawText = rawText;
    if (filePayloads && Array.isArray(filePayloads) && filePayloads.length > 0) {
      const fileSections = filePayloads.map((file: any, index: number) => {
        return `--- File ${index + 1}: ${file.fileName || 'unknown'} (${file.type || 'unknown type'}, ${file.size || 0} bytes) ---\n${file.content || ''}`;
      });

      const filePayloadText = fileSections.join('\n\n');
      processedRawText = rawText
        ? `${rawText}\n\n=== MULTI-FILE UPLOAD ===\n${filePayloadText}`
        : `=== MULTI-FILE UPLOAD ===\n${filePayloadText}`;
    }

    const systemInstruction = ANALYZE_PROMPT(domain);

    // Primary Gemini API Call
    const modelsToTry = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let aiRes: Response | null = null;
    let lastErr = "";

    for (const model of modelsToTry) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      try {
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemInstruction },
                  { text: `Domain: ${domain}\nReport Title context: ${title}\n\nData Payload:\n${processedRawText.slice(0, 50000)}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              topP: 0.1,
              response_mime_type: "application/json"
            }
          })
        });

        if (res.ok) {
          aiRes = res;
          break;
        } else {
          lastErr = await res.text();
          console.warn(`Model ${model} returned status ${res.status}:`, lastErr);
        }
      } catch (fErr: any) {
        lastErr = fErr.message;
      }
    }

    if (!aiRes || !aiRes.ok) {
      console.error("Gemini API Error across all models:", lastErr);
      return new Response(
        JSON.stringify({ error: `Gemini API returned error: ${lastErr}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiRes.json();
    const candidateParts = aiJson?.candidates?.[0]?.content?.parts || [];
    let rawOutputText = "";
    
    for (const part of candidateParts) {
      if (part.text) {
        rawOutputText += part.text;
      }
    }

    if (!rawOutputText) {
      throw new Error("Empty response text from AI model");
    }

    const cleanedText = cleanJSON(rawOutputText);
    const parsedData = JSON.parse(cleanedText);

    // Generate a unique report ID
    const reportId = crypto.randomUUID();
    const finalReport = {
      id: reportId,
      ...parsedData
    };

    // Optionally persist report to Supabase DB if credentials exist
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("reports").insert([
          {
            id: reportId,
            title: finalReport.title || title,
            summary: finalReport.summary || '',
            metrics: finalReport.metrics || [],
            charts: finalReport.charts || [],
            anomalies: finalReport.anomalies || [],
            created_at: new Date().toISOString()
          }
        ]);
      } catch (dbErr) {
        console.warn("Could not insert report into Supabase DB (non-fatal):", dbErr);
      }
    }

    return new Response(JSON.stringify(finalReport), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
