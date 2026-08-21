const MOCK_MODE = true;

export async function fetchReportHistory() {
  if (MOCK_MODE) {
    return [
      { id: "r1", title: "Q2 Retail Sales", created_at: "2026-08-18" },
      { id: "r2", title: "College Fest Ticket Sales", created_at: "2026-08-19" },
    ];
  }
  // real Supabase call goes here later
}