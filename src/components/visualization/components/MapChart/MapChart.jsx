import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { tanzaniaRegions } from './tanzania-data';
import 'leaflet/dist/leaflet.css';
import './MapChart.css';

function MapChart({ sheetData = [] }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [dataColumn, setDataColumn] = useState('');
  const [districtData, setDistrictData] = useState(null);
  const [regionData, setRegionData] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [hoverPopup, setHoverPopup] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [adm1GeoJson, setAdm1GeoJson] = useState(null);
  const [adm2GeoJson, setAdm2GeoJson] = useState(null);
  const [hoverRegion, setHoverRegion] = useState(null);
  const [hoverDistrict, setHoverDistrict] = useState(null); // {name, regionName}

  // Load GeoJSON data for Tanzania ADM1 (regions) and ADM2 (districts)
// Load local GeoJSON data for Tanzania ADM1 (regions) and ADM2 (districts)
  useEffect(() => {
    fetch('/geojson/ADM1.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(setAdm1GeoJson)
      .catch(err => {
        console.error('Error loading ADM1 GeoJSON:', err);
        // Fallback: Set to null, and handle in render
      });

    fetch('/geojson/ADM2.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(setAdm2GeoJson)
      .catch(err => {
        console.error('Error loading ADM2 GeoJSON:', err);
        // Fallback: Set to null, and handle in render
      });
  }, []);

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

  // Find region summary data
  useEffect(() => {
    if (selectedRegion && !selectedDistrict && sheetData && sheetData.length > 0 && dataColumn) {
      const regionRows = sheetData.filter(row => row.ADM1_NAME === selectedRegion.name);
      const numericValues = regionRows
        .map(row => parseFloat(row[dataColumn]))
        .filter(v => !isNaN(v));
      
      if (numericValues.length > 0) {
        const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        setRegionData({
          avgValue: avg.toFixed(2),
          count: numericValues.length
        });
      } else {
        setRegionData({
          avgValue: 'No numeric data',
          count: 0
        });
      }
    } else {
      setRegionData(null);
    }
  }, [selectedRegion, selectedDistrict, sheetData, dataColumn]);

  const handleRegionClick = (region) => {
    if (expandedRegion === region.name) {
      setExpandedRegion(null);
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setDistrictData(null);
      setRegionData(null);
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

  const handleLocationHover = (location, isDistrict = false, regionNameForDistrict = null) => {
    if (!sheetData || sheetData.length === 0 || !dataColumn) return;

    let locationData = null;
    let regionForPopup = null;
    
    if (isDistrict) {
      const regionName = regionNameForDistrict || selectedRegion?.name;
      locationData = sheetData.find(row => 
        row.ADM2_NAME === location.name && 
        row.ADM1_NAME === regionName
      );
      regionForPopup = regionName;
    } else {
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
        region: regionForPopup
      });
    } else {
      setHoverPopup({
        title: location.name,
        data: 'No data available',
        dataColumn: dataColumn,
        isDistrict: isDistrict,
        region: regionForPopup
      });
    }
  };

  const handleLocationLeave = () => {
    setHoverPopup(null);
    setHoverRegion(null);
    setHoverDistrict(null);
  };

  const handleMouseMove = (e) => {
    setPopupPosition({ x: e.clientX, y: e.clientY });
  };

  // Style function for ADM1 (regions)
  const adm1Style = (feature) => {
    const shapeName = feature.properties?.shapeName;
    const isSelected = selectedRegion?.name === shapeName;
    const isHovered = hoverRegion?.name === shapeName;
    return {
      fillColor: isSelected ? '#1e3a8a' : isHovered ? '#3b82f6' : '#e5e7eb',
      fillOpacity: isSelected ? 0.5 : isHovered ? 0.3 : 0.1,
      color: isSelected ? '#1e3a8a' : isHovered ? '#3b82f6' : '#9ca3af',
      weight: isSelected ? 3 : isHovered ? 2 : 1,
    };
  };

  // onEachFeature for ADM1
  const onEachAdm1Feature = (feature, layer) => {
    const regionName = feature.properties?.shapeName;
    const region = tanzaniaRegions.find(r => r.name === regionName);
    if (region) {
      layer.on({
        mouseover: (e) => {
          setHoverRegion(region);
          handleLocationHover(region, false);
        },
        mouseout: handleLocationLeave,
      });
    }
  };

  // Style function for ADM2 (districts)
  const adm2Style = (feature) => {
    const shapeName = feature.properties?.shapeName;
    const isSelected = selectedDistrict?.name === shapeName;
    const isHovered = hoverDistrict?.name === shapeName;
    return {
      fillColor: isSelected ? '#1e3a8a' : isHovered ? '#3b82f6' : '#e5e7eb',
      fillOpacity: isSelected ? 0.5 : isHovered ? 0.3 : 0.05,
      color: isSelected ? '#1e3a8a' : isHovered ? '#3b82f6' : '#9ca3af',
      weight: isSelected ? 3 : isHovered ? 2 : 1,
    };
  };

  // onEachFeature for ADM2
  const onEachAdm2Feature = (feature, layer) => {
    const districtName = feature.properties?.shapeName;
    let regionObj = null;
    let distObj = null;
    for (const r of tanzaniaRegions) {
      const d = r.districts.find(dd => dd.name === districtName);
      if (d) {
        regionObj = r;
        distObj = d;
        break;
      }
    }
    if (distObj) {
      layer.on({
        mouseover: () => {
          setHoverDistrict({ name: districtName, regionName: regionObj.name });
          handleLocationHover({ name: districtName }, true, regionObj.name);
        },
        mouseout: handleLocationLeave,
      });
    }
  };

  // Custom icon for selected region
  const getRegionIcon = () => {
    const content = `📍<br/><strong>${selectedRegion.name}</strong><br/>Avg ${dataColumn}: ${regionData?.avgValue || 'N/A'}<br/>Dists: ${regionData?.count || 0}`;
    return divIcon({
      html: `<div class="custom-marker">${content}</div>`,
      className: 'custom-div-icon',
      iconSize: null,
      iconAnchor: [0, 0]
    });
  };

  // Custom icon for selected district
  const getDistrictIcon = () => {
    const content = `📍<br/><strong>${selectedDistrict.name}</strong><br/>${dataColumn}: ${districtData?.displayValue || 'N/A'}`;
    return divIcon({
      html: `<div class="custom-marker">${content}</div>`,
      className: 'custom-div-icon',
      iconSize: null,
      iconAnchor: [0, 0]
    });
  };

  if (!adm1GeoJson || !adm2GeoJson) {
    return (
      <div className="map-chart-container">
        <div className="data-column-selector">
          {sheetData && sheetData.length > 0 && (
            <>
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
            </>
          )}
        </div>
        <div className="map-display">Loading map boundaries...</div>
      </div>
    );
  }

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
                  onMouseEnter={() => {
                    setHoverRegion(region);
                    handleLocationHover(region, false);
                  }}
                  onMouseLeave={handleLocationLeave}
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
                          onMouseEnter={() => {
                            setHoverDistrict({ name: district.name, regionName: region.name });
                            handleLocationHover(district, true, region.name);
                          }}
                          onMouseLeave={handleLocationLeave}
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
          <MapContainer
            center={[-6.3690, 34.8888]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON 
              data={adm1GeoJson} 
              style={adm1Style} 
              onEachFeature={onEachAdm1Feature} 
            />
            <GeoJSON 
              data={adm2GeoJson} 
              style={adm2Style} 
              onEachFeature={onEachAdm2Feature} 
            />
            {selectedRegion && !selectedDistrict && selectedRegion.lat && selectedRegion.lng && (
              <Marker position={[selectedRegion.lat, selectedRegion.lng]} icon={getRegionIcon()} />
            )}
            {selectedDistrict && selectedDistrict.lat && selectedDistrict.lng && (
              <Marker position={[selectedDistrict.lat, selectedDistrict.lng]} icon={getDistrictIcon()} />
            )}
          </MapContainer>
          <div className="map-attribution">
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">
              View Larger Map
            </a>
            <br />
            Boundaries: <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener noreferrer">geoBoundaries</a>
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
              {regionData && dataColumn && (
                <div className="district-data">
                  <h4>Region Data Summary</h4>
                  <p><strong>{dataColumn} Avg:</strong> {regionData.avgValue}</p>
                  <p><strong>Districts with data:</strong> {regionData.count}</p>
                </div>
              )}
              {!regionData && sheetData && sheetData.length > 0 && (
                <p className="no-data-warning">No data found for this region in the Excel file</p>
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