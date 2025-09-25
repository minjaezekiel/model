// Updated Visualization.jsx
import React, { useState, useEffect } from "react";
import VisualizationModal from "./components/VisualizationModal";
import "./Visualization.css";

function Visualization({ onSelect, sheetData, sheetName }) {
  const [selected, setSelected] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Extract column names from the sheet data
    if (sheetData && sheetData.length > 0) {
      const columnNames = Object.keys(sheetData[0]);
      setColumns(columnNames);
      console.log("Available columns:", columnNames);
    } else {
      console.log("No sheet data available");
      setColumns([]);
    }
  }, [sheetData]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    
    if (value && columns.length > 0) {
      setShowModal(true);
      if (onSelect) onSelect(value);
    } else if (value && columns.length === 0) {
      console.error("No columns available for visualization");
      alert("No data available for visualization. Please check your sheet data.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelected("");
  };

  return (
    <>
      <div className="dropdown-container">
        <select value={selected} onChange={handleChange}>
          <option value="">Select Visualization</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Graph</option>
          <option value="pie">Pie Chart</option>
          <option value="scatter">Scatter Plot</option>
          <option value="map">Map Chart</option>
        </select>
      </div>
      
      {showModal && (
        <VisualizationModal
          data={sheetData || []}
          columns={columns}
          isOpen={showModal}
          onClose={handleCloseModal}
          chartType={selected}
        />
      )}
    </>
  );
}

export default Visualization;