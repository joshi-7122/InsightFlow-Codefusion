import { useState, useRef } from "react";
import "./UploadPanel.css";

const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "text/plain",
];

export default function UploadPanel({ onFileReady }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function validateAndSetFile(file) {
    if (!file) return;
    const isAccepted =
      ACCEPTED_TYPES.includes(file.type) ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".xlsx");

    if (!isAccepted) {
      setError("Unsupported file type. Try CSV, XLSX, image, or text.");
      return;
    }
    setError("");
    setSelectedFile(file);
    if (onFileReady) onFileReady(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleBrowseClick() {
    inputRef.current?.click();
  }

  function handleFileInputChange(e) {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  }

  function handleRemove() {
    setSelectedFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="upload-panel">
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${
          selectedFile ? "has-file" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleBrowseClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,image/*,text/plain"
          onChange={handleFileInputChange}
          hidden
        />

        {!selectedFile ? (
          <>
            <div className="drop-icon">↑</div>
            <p className="drop-title">Drop your data. Get your report.</p>
            <p className="drop-sub">
              CSV, XLSX, dashboard screenshot, or a text note — click to browse
            </p>
          </>
        ) : (
          <div className="file-preview">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}