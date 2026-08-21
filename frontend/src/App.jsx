import ChatFollowUp from "./components/ChatFollowUp";

function App() {
  return (
    <div style={{ padding: 40 }}>
      <h1>InsightFlow — Chat Test</h1>
      <ChatFollowUp
        reportId="r1"
        onChartUpdate={(d) => console.log("new chart data:", d)}
      />
    </div>
  );
}

export default App;