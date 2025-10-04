import React from 'react';
import './MapChart.css';

function InfoPanel({ selectedRegion, selectedDistrict, districtData, regionData, dataColumn }) {
  if (selectedDistrict) {
    return (
      <div className="info-panel-container">
        <h3>{selectedDistrict.name} District</h3>
        <p>Region: {selectedRegion.name}</p>
        <p>Coordinates: {selectedDistrict.lat?.toFixed(4)}, {selectedDistrict.lng?.toFixed(4)}</p>
        {districtData && dataColumn && (
          <div className="district-data">
            <h4>Excel Data</h4>
            <p><strong>{dataColumn}:</strong> {districtData.displayValue}</p>
            {districtData.ADM1_PCODE && <p><strong>Region Code:</strong> {districtData.ADM1_PCODE}</p>}
            {districtData.ADM2_PCODE && <p><strong>District Code:</strong> {districtData.ADM2_PCODE}</p>}
          </div>
        )}
        {!districtData && <p className="no-data-warning">No data found for this district</p>}
      </div>
    );
  }

  if (selectedRegion) {
    return (
      <div className="info-panel-container">
        <h3>{selectedRegion.name} Region</h3>
        <p>Coordinates: {selectedRegion.lat?.toFixed(4)}, {selectedRegion.lng?.toFixed(4)}</p>
        <p>Districts: {selectedRegion.districts.length}</p>
        {regionData && dataColumn && (
          <div className="district-data">
            <h4>Region Summary</h4>
            <p><strong>{dataColumn} Avg:</strong> {regionData.avgValue}</p>
            <p><strong>Districts with data:</strong> {regionData.count}</p>
          </div>
        )}
        {!regionData && <p className="no-data-warning">No data found for this region</p>}
      </div>
    );
  }

  return null;
}

export default InfoPanel;