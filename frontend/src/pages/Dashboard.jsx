import { useEffect, useState } from "react";
import { fetchReportHistory } from "../lib/api/reports";

export default function Dashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReportHistory().then(setReports);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Past Reports</h2>
      {reports.map((r) => (
        <div key={r.id} style={{ padding: 12, borderBottom: "1px solid #333" }}>
          <b>{r.title}</b>
          <div style={{ fontSize: 12, color: "#888" }}>{r.created_at}</div>
        </div>
      ))}
    </div>
  );
}