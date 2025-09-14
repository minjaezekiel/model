import React, { useEffect, useState } from "react";
import { loadExcel } from "../utils/excel";
import SearchBar from "../components/SearchBar";
import Visualization from "../components/Visualization";
import DataEntry from "../components/DataEntry";
import DownloadButton from "../components/DownloadButton";
import "./Home.css";

function Home() {
  const [sheets, setSheets] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [customFile, setCustomFile] = useState(null);
  const [fileName, setFileName] = useState("model.xlsx");
  const rowsPerPage = 20;

  useEffect(() => {
    async function fetchExcel() {
      try {
        const filePath = customFile ? URL.createObjectURL(customFile) : "/model.xlsx";
        const { sheets } = await loadExcel(filePath);
        setSheets(sheets);
        setActiveSheet(Object.keys(sheets)[0]);
      } catch (error) {
        console.error("Error loading Excel file:", error);
      }
    }
    fetchExcel();
  }, [customFile]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCustomFile(file);
      setFileName(file.name);
      setSearchQuery("");
      setCurrentPage(1);
    }
  };

  const removeUploadedFile = () => {
    setCustomFile(null);
    setFileName("model.xlsx");
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (!sheets) return <p>Loading Excel...</p>;

  let data = sheets[activeSheet] || [];

  // 🔍 Search
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="home-container">
      {/* File Upload Section */}
      <div className="file-upload-container">
        <div className="file-info">
          <span>Current file: {fileName}</span>
          {customFile && (
            <button className="remove-file-btn" onClick={removeUploadedFile}>
              Remove Uploaded File
            </button>
          )}
        </div>
        <div className="upload-btn-wrapper">
          <label htmlFor="file-upload" className="upload-btn">
            Upload Excel File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Navbar */}
      <div className="navbar">
        {Object.keys(sheets).map((sheetName) => (
          <button
            key={sheetName}
            onClick={() => {
              setActiveSheet(sheetName);
              setCurrentPage(1);
              setSearchQuery("");
            }}
            className={`nav-btn ${
              activeSheet === sheetName ? "active" : ""
            }`}
          >
            {sheetName}
          </button>
        ))}
      </div>

      {/* Toolbar: Search + Visualization + Data Entry */}
      <div className="toolbar-horizontal">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Visualization 
          onSelect={(type) => console.log("Chart:", type)}
          sheetData={sheets[activeSheet] || []}
          sheetName={activeSheet}
        />
        <DownloadButton sheets={sheets} />
      </div>

      {/* Download Button - Full Width */}
      <div className="dataentry-container">
      <DataEntry
          sheetData={sheets[activeSheet]}
          setSheetData={(newData) =>
            setSheets({ ...sheets, [activeSheet]: newData })
          }
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <h2>{activeSheet}</h2>
        <table>
          <thead>
            <tr>
              {Object.keys(data[0] || {}).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ◀ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

export default Home;