// MapChart.jsx
import React, { useState, useEffect } from 'react';
import { tanzaniaRegions } from './tanzania-data';
import './MapChart.css';

function MapChart({ sheetData = [] }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [dataColumn, setDataColumn] = useState('');
  const [districtData, setDistrictData] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [hoverPopup, setHoverPopup] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Extract available columns from sheet data
  useEffect(() => {
    if (sheetData && sheetData.length > 0) {
      const columns = Object.keys(sheetData[0]).filter(col => 
        col !== 'COUNTRY' && col !== 'ADM1_NAME' && col !== 'ADM2_NAME' && 
        col !== 'ISO3' && col !== 'ADM1_PCODE' && col !== 'ADM2_PCODE'
      );
      setAvailableColumns(columns);
      if (columns.length > 0) {
        setDataColumn(columns[0]);
      }
    }
  }, [sheetData]);

  // Find district data when district or data column changes
  useEffect(() => {
    if (selectedDistrict && sheetData && sheetData.length > 0 && dataColumn) {
      const districtRow = sheetData.find(row => 
        row.ADM2_NAME === selectedDistrict.name && 
        row.ADM1_NAME === selectedRegion.name
      );
      
      if (districtRow) {
        setDistrictData({
          ...districtRow,
          displayValue: districtRow[dataColumn] || 'No data'
        });
      } else {
        setDistrictData(null);
      }
    } else {
      setDistrictData(null);
    }
  }, [selectedDistrict, sheetData, dataColumn, selectedRegion]);

  const handleRegionClick = (region) => {
    if (expandedRegion === region.name) {
      setExpandedRegion(null);
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setDistrictData(null);
      setHoverPopup(null);
    } else {
      setExpandedRegion(region.name);
      setSelectedRegion(region);
      setSelectedDistrict(null);
      setDistrictData(null);
      setHoverPopup(null);
    }
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
    setHoverPopup(null);
  };

  const handleMapMarkerHover = (location, isDistrict = false) => {
    if (!sheetData || sheetData.length === 0 || !dataColumn) return;

    let locationData = null;
    
    if (isDistrict && selectedRegion) {
      // Find district data
      locationData = sheetData.find(row => 
        row.ADM2_NAME === location.name && 
        row.ADM1_NAME === selectedRegion.name
      );
    } else if (!isDistrict) {
      // Find region data (try to find any district in this region)
      locationData = sheetData.find(row => 
        row.ADM1_NAME === location.name
      );
    }

    if (locationData) {
      setHoverPopup({
        title: location.name,
        data: locationData[dataColumn] || 'No data',
        dataColumn: dataColumn,
        isDistrict: isDistrict,
        region: isDistrict ? selectedRegion.name : null
      });
    } else {
      setHoverPopup({
        title: location.name,
        data: 'No data available',
        dataColumn: dataColumn,
        isDistrict: isDistrict,
        region: isDistrict ? selectedRegion.name : null
      });
    }
  };

  const handleMapMarkerLeave = () => {
    setHoverPopup(null);
  };

  const handleMouseMove = (e) => {
    setPopupPosition({ x: e.clientX, y: e.clientY });
  };

  const getEmbedUrl = () => {
    if (selectedDistrict) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${selectedDistrict.lng - 0.2}%2C${selectedDistrict.lat - 0.2}%2C${selectedDistrict.lng + 0.2}%2C${selectedDistrict.lat + 0.2}&layer=mapnik&marker=${selectedDistrict.lat}%2C${selectedDistrict.lng}`;
    }
    if (selectedRegion) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${selectedRegion.lng - 0.5}%2C${selectedRegion.lat - 0.5}%2C${selectedRegion.lng + 0.5}%2C${selectedRegion.lat + 0.5}&layer=mapnik&marker=${selectedRegion.lat}%2C${selectedRegion.lng}`;
    }
    // Default view of Tanzania
    return 'https://www.openstreetmap.org/export/embed.html?bbox=29.0%2C-11.8%2C40.5%2C-0.9&layer=mapnik&marker=-6.3690%2C34.8888';
  };

  // Add custom markers with hover effects
  const addCustomMarkers = () => {
    if (!selectedRegion && !selectedDistrict) return '';
    
    let markers = '';
    
    if (selectedDistrict) {
      // Add district marker
      markers += `&marker=${selectedDistrict.lat}%2C${selectedDistrict.lng}`;
    } else if (selectedRegion) {
      // Add region marker and all district markers in the region
      markers += `&marker=${selectedRegion.lat}%2C${selectedRegion.lng}`;
      
      selectedRegion.districts.forEach(district => {
        markers += `&marker=${district.lat}%2C${district.lng}`;
      });
    }
    
    return markers;
  };

  const getEnhancedEmbedUrl = () => {
    let baseUrl = getEmbedUrl();
    const markers = addCustomMarkers();
    return baseUrl + markers;
  };

  return (
    <div className="map-chart-container" onMouseMove={handleMouseMove}>

      {/* Data Column Selector */}
      {sheetData && sheetData.length > 0 && (
        <div className="data-column-selector">
          <label htmlFor="data-column">Display Data: </label>
          <select 
            id="data-column"
            value={dataColumn} 
            onChange={(e) => setDataColumn(e.target.value)}
          >
            {availableColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      )}

      <div className="map-content">
        <div className="regions-sidebar">
          <h3>Tanzania Regions</h3>
          <div className="regions-list">
            {tanzaniaRegions.map(region => (
              <div key={region.name}>
                <div
                  className={`region-item ${selectedRegion?.name === region.name ? 'selected' : ''}`}
                  onClick={() => handleRegionClick(region)}
                  onMouseEnter={() => handleMapMarkerHover(region, false)}
                  onMouseLeave={handleMapMarkerLeave}
                >
                  {region.name}
                  <span className="toggle-icon">
                    {expandedRegion === region.name ? '−' : '+'}
                  </span>
                </div>
                
                {expandedRegion === region.name && (
                  <div className="districts-container">
                    <div className="districts-list">
                      {region.districts.map(district => (
                        <div
                          key={district.name}
                          className={`district-item ${selectedDistrict?.name === district.name ? 'selected' : ''}`}
                          onClick={() => handleDistrictClick(district)}
                          onMouseEnter={() => handleMapMarkerHover(district, true)}
                          onMouseLeave={handleMapMarkerLeave}
                        >
                          {district.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="map-display">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={getEnhancedEmbedUrl()}
            title="Tanzania Map"
            className="osm-iframe"
          />
          <div className="map-attribution">
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">
              View Larger Map
            </a>
          </div>
        </div>
      </div>

      {/* Hover Popup */}
      {hoverPopup && (
        <div 
          className="map-hover-popup"
          style={{
            position: 'fixed',
            left: `${popupPosition.x + 15}px`,
            top: `${popupPosition.y + 15}px`,
            zIndex: 1000
          }}
        >
          <div className="popup-content">
            <h4>{hoverPopup.title}</h4>
            {hoverPopup.isDistrict && hoverPopup.region && (
              <p className="popup-region">Region: {hoverPopup.region}</p>
            )}
            <p className="popup-data">
              <strong>{hoverPopup.dataColumn}:</strong> {hoverPopup.data}
            </p>
          </div>
        </div>
      )}

      {(selectedRegion || selectedDistrict) && (
        <div className="location-info">
          {selectedDistrict ? (
            <>
              <h3>{selectedDistrict.name} District</h3>
              <p>Region: {selectedRegion.name}</p>
              <p>Coordinates: {selectedDistrict.lat.toFixed(4)}, {selectedDistrict.lng.toFixed(4)}</p>
              {districtData && dataColumn && (
                <div className="district-data">
                  <h4>Excel Data</h4>
                  <p><strong>{dataColumn}:</strong> {districtData.displayValue}</p>
                  {districtData.ADM1_PCODE && <p><strong>Region Code:</strong> {districtData.ADM1_PCODE}</p>}
                  {districtData.ADM2_PCODE && <p><strong>District Code:</strong> {districtData.ADM2_PCODE}</p>}
                </div>
              )}
              {!districtData && sheetData && sheetData.length > 0 && (
                <p className="no-data-warning">No data found for this district in the Excel file</p>
              )}
            </>
          ) : (
            <>
              <h3>{selectedRegion.name} Region</h3>
              <p>Coordinates: {selectedRegion.lat.toFixed(4)}, {selectedRegion.lng.toFixed(4)}</p>
              <p>Districts: {selectedRegion.districts.length}</p>
              {sheetData && sheetData.length > 0 && dataColumn && (
                <div className="district-data">
                  <h4>Region Data Preview</h4>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!sheetData || sheetData.length === 0 ? (
        <div className="data-warning">
          <p>⚠️ No Excel data loaded. Please upload an Excel file with Tanzania district data.</p>
        </div>
      ) : null}
    </div>
  );
}

export default MapChart;