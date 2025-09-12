// Updated Visualization.jsx
import React, { useState } from "react";
import VisualizationModal from "./VisualizationModal";
import "./Visualization.css";

function Visualization({ onSelect, sheetData, sheetName }) {
  const [selected, setSelected] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    
    if (value) {
      setShowModal(true);
      if (onSelect) onSelect(value);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelected("");
  };

  // Get column names from the first row of data
  const columns = sheetData && sheetData.length > 0 
    ? Object.keys(sheetData[0]) 
    : [];

  return (
    <>
      <div className="dropdown-container">
        <select value={selected} onChange={handleChange}>
          <option value="">Select Visualization</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Graph</option>
          <option value="pie">Pie Chart</option>
          <option value="scatter">Scatter Plot</option>
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