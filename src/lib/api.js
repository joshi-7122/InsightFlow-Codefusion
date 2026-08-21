import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dtnudqyshscogntcivfj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function analyzeInput({ files = [], textNote = '', domain = 'general', title, userId }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing.');
  }

  // Extract content safely and truncate to avoid huge payloads
  const filePayloads = await Promise.all(
    files.map(async (f) => {
      let content = '';
      try {
        content = await f.text();
      } catch {
        content = `[Attached: ${f.name}]`;
      }
      return {
        fileName: f.name,
        type: f.type,
        size: f.size,
        content: content.slice(0, 20000),
      };
    })
  );

  const endpoint = `${supabaseUrl}/functions/v1/analyze-upload`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        filePayloads,
        rawText: textNote,
        domain,
        title: title || (files.length > 0 ? files.map(f => f.name).join(', ') : 'Quick Analysis'),
        userId,
      }),
    });
  } catch (netErr) {
    throw new Error(`Network/CORS blocked the request or the Edge Function timed out. Details: ${netErr.message}`);
  }

  if (!response.ok) {
    const errBody = await response.text();
    console.error('Edge Function HTTP error:', response.status, errBody);
    throw new Error(`Edge Function returned status ${response.status}: ${errBody}`);
  }

  return await response.json();
}

/**
 * Sends a follow-up chat question for a cached report
 */
export async function sendFollowUpChat({ reportId, message }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const endpoint = `${supabaseUrl}/functions/v1/chat-followup`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ reportId, message }),
    });
  } catch (netErr) {
    throw new Error(`Network/CORS blocked the request or the Edge Function timed out. Details: ${netErr.message}`);
  }

  if (!response.ok) {
    const errBody = await response.text();
    console.error('Edge Function HTTP error:', response.status, errBody);
    throw new Error(`Edge Function returned status ${response.status}: ${errBody}`);
  }

  const data = await response.json();

  return {
    answer: data?.answer || data?.response || 'No response generated.',
    chart_update: data?.chart_update || null
  };
}

/**
 * Fetches saved report history ordered by created_at desc
 */
export async function fetchReportHistory() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching report history:', error);
    return [];
  }

  return data || [];
}
