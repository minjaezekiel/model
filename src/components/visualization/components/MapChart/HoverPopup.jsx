import React from 'react';
import './MapChart.css';

function HoverPopup({ info, dataColumn }) {
  // Use info.dataColumn if available, fallback to prop
  const columnLabel = info.dataColumn || dataColumn || 'Value';
  return (
    <div 
      className="hover-popup-container"
      style={{
        position: 'fixed',
        left: `${info.x || 0 + 15}px`,  // Assumes info has mouse position; adjust if needed
        top: `${info.y || 0 + 15}px`,
        zIndex: 1000
      }}
    >
      <div className="popup-content">
        <h4>{info.title}</h4>
        {info.isDistrict && info.region && <p className="popup-region">Region: {info.region}</p>}
        <p className="popup-data"><strong>{columnLabel}:</strong> {info.data}</p>
        {info.lat !== null && info.lng !== null && (
          <p className="popup-coords">
            <strong>Coordinates:</strong> Lat: {info.lat.toFixed(4)}, Lng: {info.lng.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
}

export default HoverPopup;