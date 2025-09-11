import React, { useState } from "react";
import "./Visualization.css";

function Visualization({ onSelect }) {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    onSelect(value);
  };

  return (
    <div className="dropdown-container">
      <select value={selected} onChange={handleChange}>
        <option value="">Select Visualization</option>
        <option value="bar">Bar Chart</option>
        <option value="line">Line Graph</option>
        <option value="pie">Pie Chart</option>
      </select>
    </div>
  );
}

export default Visualization;