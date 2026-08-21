import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dtnudqyshscogntcivfj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper to convert File to Base64 string (without Data URI prefix)
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const base64Data = typeof result === 'string' ? result.split(',')[1] : '';
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Analyzes input data (File, text note, or domain context) via Supabase Edge Function
 */
export async function analyzeInput({ files, file, textNote, domain = 'general', title, userId }) {
  let rawText = textNote || '';
  const filePayloads = [];

  const processFile = async (f) => {
    const isText = f.type.startsWith('text/') || 
      /\.(csv|txt|json|md|tsv|log)$/i.test(f.name);
    
    let content = '';
    if (isText) {
      content = await f.text();
    } else {
      const b64 = await fileToBase64(f);
      content = `[Binary/Media File base64 encoded: ${b64.slice(0, 1000)}...]`;
    }

    return {
      fileName: f.name,
      type: f.type,
      size: f.size,
      content
    };
  };

  // Handle single file (backward compatibility)
  if (file) {
    const p = await processFile(file);
    rawText = rawText ? `${rawText}\n\n${p.content}` : p.content;
    filePayloads.push(p);
  }

  // Handle multiple files
  if (files && files.length > 0) {
    const filePromises = files.map(processFile);
    filePayloads.push(...await Promise.all(filePromises));

    if (!rawText) {
      rawText = filePayloads.map(p => `--- File: ${p.fileName} ---\n${p.content}`).join('\n\n');
    }
  }

  console.log('Sending payload to analyze-upload Edge Function...');
  const customHeaders = SUPABASE_ANON_KEY ? {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  } : {};

  const { data, error } = await supabase.functions.invoke('analyze-upload', {
    body: {
      rawText,
      filePayloads,
      domain,
      title: title || (files && files.length > 0 ? files.map(f => f.name).join(', ') : file?.name || 'Dataset Analysis'),
      userId: userId || null
    },
    headers: customHeaders
  });

  if (error) {
    console.error('Supabase Edge Function invocation failed:', error);
    let errorMsg = error.message || 'Edge function execution failed';
    if (error.context && error.context.json) {
      try {
        const errJson = await error.context.json();
        if (errJson?.error) errorMsg = errJson.error;
      } catch (_) {}
    }
    throw new Error(errorMsg);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  console.log('Live backend data received:', data);
  return data;
}

/**
 * Sends a follow-up chat question for a cached report
 */
export async function sendFollowUpChat({ reportId, message }) {
  const customHeaders = SUPABASE_ANON_KEY ? {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  } : {};

  const { data, error } = await supabase.functions.invoke('chat-followup', {
    body: { reportId, message },
    headers: customHeaders
  });

  if (error) {
    throw error;
  }

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
