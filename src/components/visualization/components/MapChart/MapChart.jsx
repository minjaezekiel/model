import React, { useState, useEffect } from 'react';
import { MapContainer } from 'react-leaflet';
import Sidebar from './Sidebar';
import MapDisplay from './MapDisplay';
import InfoPanel from './InfoPanel';
import HoverPopup from './HoverPopup';
import { detectDataType, getColorForValue, getStyleForFeature } from './utils';
import { tanzaniaRegions } from './tanzania-data'; // Adjust path if needed
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
  const [hoverInfo, setHoverInfo] = useState(null);
  const [dataType, setDataType] = useState('numerical'); // 'numerical' or 'categorical'
  const [colorScale, setColorScale] = useState({}); // For numerical: {min, max, classes}
  const [adm1GeoJson, setAdm1GeoJson] = useState(null);
  const [adm2GeoJson, setAdm2GeoJson] = useState(null);

  // Load GeoJSON
  useEffect(() => {
    fetch('/geojson/ADM1.geojson')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load ADM1')))
      .then(setAdm1GeoJson)
      .catch(err => console.error('Error loading ADM1 GeoJSON:', err));

    fetch('/geojson/ADM2.geojson')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load ADM2')))
      .then(setAdm2GeoJson)
      .catch(err => console.error('Error loading ADM2 GeoJSON:', err));
  }, []);

  // Initialize columns and set initial dataColumn (only once, when sheetData changes)
  useEffect(() => {
    if (sheetData.length > 0) {
      const columns = Object.keys(sheetData[0]).filter(col => 
        !['COUNTRY', 'ADM1_NAME', 'ADM2_NAME', 'ISO3', 'ADM1_PCODE', 'ADM2_PCODE'].includes(col)
      );
      setAvailableColumns(columns);
      // Only set initial dataColumn if not already selected (prevents reset on change)
      if (!dataColumn && columns.length > 0) {
        setDataColumn(columns[0]);
      }
    } else {
      setAvailableColumns([]);
      setDataColumn('');
    }
  }, [sheetData]); // Depend only on sheetData

  // Detect type and scale when dataColumn changes
  useEffect(() => {
    if (sheetData.length > 0 && dataColumn) {
      const { type, scale } = detectDataType(sheetData, dataColumn);
      setDataType(type);
      setColorScale(scale);
    }
  }, [sheetData, dataColumn]); // Depend on both, but no reset here

  // Region summary
  useEffect(() => {
    if (selectedRegion && !selectedDistrict && dataColumn) {
      const regionRows = sheetData.filter(row => row.ADM1_NAME === selectedRegion.name);
      const values = regionRows.map(row => row[dataColumn]).filter(v => v != null);
      if (values.length > 0) {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        const avg = numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : null;
        setRegionData({ avgValue: avg?.toFixed(2) || 'N/A', count: values.length });
      } else {
        setRegionData({ avgValue: 'No data', count: 0 });
      }
    } else {
      setRegionData(null);
    }
  }, [selectedRegion, selectedDistrict, sheetData, dataColumn]);

  // District data
  useEffect(() => {
    if (selectedDistrict && selectedRegion && dataColumn) {
      const districtRow = sheetData.find(row => 
        row.ADM2_NAME === selectedDistrict.name && row.ADM1_NAME === selectedRegion.name
      );
      setDistrictData(districtRow ? { ...districtRow, displayValue: districtRow[dataColumn] || 'No data' } : null);
    } else {
      setDistrictData(null);
    }
  }, [selectedDistrict, selectedRegion, sheetData, dataColumn]);

  const handleRegionClick = (region) => {
    if (expandedRegion === region.name) {
      setExpandedRegion(null);
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setDistrictData(null);
      setRegionData(null);
    } else {
      setExpandedRegion(region.name);
      setSelectedRegion(region);
      setSelectedDistrict(null);
      setDistrictData(null);
    }
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
  };

  const handleHover = (info) => setHoverInfo(info);
  const handleHoverLeave = () => setHoverInfo(null);

  const mapCenter = [-6.3690, 34.8888];
  const mapZoom = 6;

  if (!adm1GeoJson || !adm2GeoJson) {
    return <div className="map-chart-container">Loading map boundaries...</div>;
  }

  return (
    <div className="map-chart-container">
      {/* Column Selector */}
      {sheetData.length > 0 && (
        <div className="data-column-selector">
          <label htmlFor="data-column">Display Data: </label>
          <select id="data-column" value={dataColumn} onChange={(e) => setDataColumn(e.target.value)}>
            {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
      )}

      <div className="map-content">
        <Sidebar
          regions={tanzaniaRegions}
          expandedRegion={expandedRegion}
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          onRegionClick={handleRegionClick}
          onDistrictClick={handleDistrictClick}
          onHover={handleHover}
          onHoverLeave={handleHoverLeave}
          sheetData={sheetData}
          dataColumn={dataColumn}
          dataType={dataType}
          colorScale={colorScale}
        />

        <MapDisplay
          adm1GeoJson={adm1GeoJson}
          adm2GeoJson={adm2GeoJson}
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          dataColumn={dataColumn}
          sheetData={sheetData}
          dataType={dataType}
          colorScale={colorScale}
          regionData={regionData}
          districtData={districtData}
          onHover={handleHover}
          onHoverLeave={handleHoverLeave}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
        />
      </div>

      {/* Selected Info Panel */}
      {(selectedRegion || selectedDistrict) && (
        <InfoPanel
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          districtData={districtData}
          regionData={regionData}
          dataColumn={dataColumn}
        />
      )}

      {/* Hover Popup */}
      {hoverInfo && <HoverPopup info={hoverInfo} dataColumn={dataColumn} />}

      {sheetData.length === 0 && (
        <div className="data-warning">
          <p>⚠️ No Excel data loaded. Please upload an Excel file with Tanzania district data.</p>
        </div>
      )}
    </div>
  );
}

export default MapChart;