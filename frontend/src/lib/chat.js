// Mock chat-followup call — swap MOCK_MODE to false once Aryan's Edge Function is ready
const MOCK_MODE = true;
const SUPABASE_FUNCTION_URL = "https://YOUR_PROJECT.functions.supabase.co/chat-followup";

export async function sendChatMessage(question, reportId) {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 600)); // fake network delay
    return {
      answer: `(mock) Here's why: sales dipped mainly in the North region due to a stock-out.`,
      updatedChart: {
        type: "bar",
        data: [
          { label: "North", value: 42 },
          { label: "South", value: 78 },
          { label: "East", value: 65 },
        ],
      },
    };
  }

  const res = await fetch(SUPABASE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, reportId }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}