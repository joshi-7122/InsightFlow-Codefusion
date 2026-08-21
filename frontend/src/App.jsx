import UploadPanel from "./components/UploadPanel";

function App() {
  function handleFileReady(file) {
    console.log("File selected:", file);
  }

  return (
    <div style={{ padding: "60px 20px" }}>
      <UploadPanel onFileReady={handleFileReady} />
    </div>
  );
}

export default App;