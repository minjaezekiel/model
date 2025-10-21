import React, { useEffect, useState } from "react";
import { 
  getExcelFromStorage, 
  uploadExcelToStorage, 
  listExcelFiles,
  downloadExcelFile,
  updateExcelInStorage
} from "../services/excelStorageService";
import { CATEGORIES, FOOTER_CONTENT } from "./categoryConfig";
import SearchBar from "../components/SearchBar";
import Visualization from "../components/visualization/Visualization";
import DataEntry from "../components/DataEntry";
import DownloadButton from "../components/DownloadButton";
import Footer from "../components/Footer";
import "./Home.css";

function Home() {
  const [currentCategory, setCurrentCategory] = useState('risk');
  const [sheets, setSheets] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [currentFileName, setCurrentFileName] = useState("model.xlsx");
  const [availableFiles, setAvailableFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const rowsPerPage = 20;

  const categoryConfig = CATEGORIES[currentCategory.toUpperCase()];

  // Update header color when category changes
  useEffect(() => {
    const header = document.getElementById('app-header');
    if (header) {
      header.style.setProperty('--primary-color', categoryConfig.color);
    }
  }, [currentCategory]);

  // Load available files and initial data when category changes
  useEffect(() => {
    loadAvailableFiles();
    loadExcelData();
  }, [currentCategory]);

  const loadAvailableFiles = async () => {
    try {
      const files = await listExcelFiles(categoryConfig.folder);
      setAvailableFiles(files);
    } catch (error) {
      console.error("Error loading file list:", error);
      setAvailableFiles([]);
    }
  };

  const loadExcelData = async (fileName = "model.xlsx") => {
    try {
      setIsDataLoaded(false);
      const { sheets, fileName: loadedFileName } = await getExcelFromStorage(categoryConfig.folder, fileName);
      setSheets(sheets);
      setCurrentFileName(fileName);
      setActiveSheet(Object.keys(sheets)[0]);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error loading Excel from storage:", error);
      setIsDataLoaded(true);
      setSheets(null);
    }
  };


  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadData = await uploadExcelToStorage(file, categoryConfig.folder);
      
      // Refresh file list and load new file
      await loadAvailableFiles();
      const fileName = uploadData.path.split('/').pop();
      await loadExcelData(fileName);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // File selection handler
  const handleFileSelect = async (fileName) => {
    await loadExcelData(fileName);
    setCurrentPage(1);
    setSearchQuery("");
  };

  // Download current file
  const handleDownload = async () => {
    try {
      const filePath = `${categoryConfig.folder}/${currentFileName}`;
      await downloadExcelFile(filePath, `download-${currentFileName}`);
    } catch (error) {
      console.error("Download failed:", error);
      alert(`Download failed: ${error.message}`);
    }
  };

  // Save changes back to storage
  const handleSaveChanges = async () => {
    if (!sheets) return;
    
    try {
      const filePath = `${categoryConfig.folder}/${currentFileName}`;
      await updateExcelInStorage(filePath, sheets);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error("Save failed:", error);
      alert(`Save failed: ${error.message}`);
    }
  };

  // Update sheet data (for DataEntry component)
  const updateSheetData = (newData) => {
    setSheets({ ...sheets, [activeSheet]: newData });
  };

  // Filter data for Tanzania if it contains multiple countries
  const getTanzaniaData = () => {
    if (!sheets || !activeSheet) return [];
    
    const data = sheets[activeSheet];
    if (!data || data.length === 0) return [];
    
    // Check if data contains Tanzania-specific columns or if it's already filtered
    const hasTanzaniaData = data.some(row => 
      row.COUNTRY === 'United Republic of Tanzania' || 
      row.ISO3 === 'TZA' ||
      (row.ADM1_NAME && typeof row.ADM1_NAME === 'string' && 
       ['Dodoma', 'Arusha', 'Kilimanjaro', 'Tanga', 'Morogoro', 'Pwani', 
        'Dar-es-salaam', 'Lindi', 'Mtwara', 'Ruvuma', 'Iringa', 'Mbeya', 
        'Singida', 'Tabora', 'Rukwa', 'Kigoma', 'Shinyanga', 'Kagera', 
        'Mwanza', 'Mara', 'Manyara', 'Njombe', 'Katavi', 'Simiyu', 'Geita', 
        'Songwe', 'Kaskazini Unguja', 'Kusini Unguja', 'Mjini Magharibi', 
        'Kaskazini Pemba', 'Kusini Pemba'].some(region => row.ADM1_NAME.includes(region)))
    );
    
    if (hasTanzaniaData) {
      return data.filter(row => 
        row.COUNTRY === 'United Republic of Tanzania' || 
        row.ISO3 === 'TZA' ||
        !row.COUNTRY // If no country column, assume it's Tanzania data
      );
    }
    
    return data;
  };

    if (!sheets && !isDataLoaded) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading {categoryConfig.name} Data...</p>
        </div>
      );
    }

  const tanzaniaData = getTanzaniaData();
  const data = tanzaniaData.length > 0 ? tanzaniaData : (sheets && sheets[activeSheet] ? sheets[activeSheet] : []);

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
    <div className="home-container" style={{ 
      '--primary-color': categoryConfig.color,
      '--secondary-color': categoryConfig.secondaryColor
    }}>
      {/* Category Navigation */}
      <div className="category-nav">
        {Object.values(CATEGORIES).map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setCurrentCategory(category.id);
              setCurrentPage(1);
              setSearchQuery("");
            }}
            className={`category-btn ${currentCategory === category.id ? 'active' : ''}`}
            style={{
              backgroundColor: currentCategory === category.id ? category.color : 'transparent',
              borderColor: category.color,
              color: currentCategory === category.id ? 'white' : category.color
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Compact Toolbar */}
      <div className="compact-toolbar">
        <div className="toolbar-group">
          <label className="upload-btn">
            {isUploading ? "⏳" : "📁 Upload"}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
          </label>
          
          <select 
            value={currentFileName} 
            onChange={(e) => handleFileSelect(e.target.value)}
            className="file-select"
          >
            <option value="">Choose Excel</option>
            {availableFiles.map((file) => (
              <option key={file.name} value={file.name}>
                {file.name}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <div className="toolbar-group">
          <Visualization 
            onSelect={(type) => console.log("Chart:", type)}
            sheetData={data}
            sheetName={activeSheet}
          />
          <DownloadButton sheets={sheets} fileName={currentFileName} />
        </div>
      </div>

      {/* Action Label */}
      <div className="action-label">
        <span>Select Action Below</span>
      </div>

      {/* Data Entry Section */}
      <div className="dataentry-container">
        <DataEntry
          sheetData={data}
          setSheetData={updateSheetData}
        />
      </div>

      {/* Sheet Navigation */}
      <div className="sheet-nav">
        {sheets && Object.keys(sheets).map((sheetName) => (
          <button
            key={sheetName}
            onClick={() => {
              setActiveSheet(sheetName);
              setCurrentPage(1);
            }}
            className={`sheet-btn ${activeSheet === sheetName ? 'active' : ''}`}
          >
            {sheetName}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h3>
            {activeSheet || "No Sheet Selected"} 
            {tanzaniaData.length > 0 ? ` (Tanzania Data - ${tanzaniaData.length} records)` : ''}
          </h3>
          <span className="record-count">{filteredData.length} records</span>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {data.length > 0 && Object.keys(data[0] || {}).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={i}>
                  {data.length > 0 && Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1 || filteredData.length === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ◀ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages || 1} 
        </span>
        <button
          disabled={currentPage === totalPages || filteredData.length === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next ▶
        </button>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons-bottom">
        <button onClick={handleDownload} className="action-btn download">
          ⬇️ Download
        </button>
        <button onClick={handleSaveChanges} className="action-btn save">
          💾 Save Changes
        </button>
      </div>

      {/* Footer */}
      <Footer currentCategory={currentCategory} />
    </div>
  );
}

export default Home;