import React from "react";
import { saveExcel } from "../utils/excel";
import "./DownloadButton.css";

function DownloadButton({ sheets }) {
  const handleDownload = () => {
    saveExcel(sheets, "updated_model.xlsx");
  };

  return (
    <button onClick={handleDownload} className="download-btn">
      <span className="download-icon">⬇</span> Download Excel
    </button>
  );
}

export default DownloadButton;