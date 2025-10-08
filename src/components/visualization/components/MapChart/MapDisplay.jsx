import React, { useCallback } from 'react';
import { TileLayer, GeoJSON, Marker, MapContainer, ScaleControl } from 'react-leaflet';
import { divIcon } from 'leaflet';
import Legend from './Legend';
import { getStyleForFeature, getColorForValue } from './utils';
import { tanzaniaRegions } from './tanzania-data'; // Adjust path
import './MapChart.css';

function MapDisplay({ adm1GeoJson, adm2GeoJson, selectedRegion, selectedDistrict, dataColumn, sheetData, dataType, colorScale, regionData, districtData, onHover, onHoverLeave, mapCenter, mapZoom }) {
  // Tanzania bounds: [[south, west], [north, east]]
  const tanzaniaBounds = [
    [-11.75, 29.34],  // Southwest
    [-1.05, 40.43]    // Northeast
  ];

  // Find lat/lng for a region
  const getRegionCoords = (regionName) => {
    const region = tanzaniaRegions.find(r => r.name === regionName);
    return region ? { lat: region.lat, lng: region.lng } : { lat: null, lng: null };
  };

  // Find lat/lng for a district (in its region)
  const getDistrictCoords = (districtName, regionName) => {
    const region = tanzaniaRegions.find(r => r.name === regionName);
    if (!region) return { lat: null, lng: null };
    const district = region.districts.find(d => d.name === districtName);
    return district ? { lat: district.lat, lng: district.lng } : getRegionCoords(regionName); // Fallback to region
  };

  // ADM1 onEachFeature (useCallback to recreate on dataColumn change)
  const onEachAdm1 = useCallback((feature, layer) => {
    const regionName = feature.properties?.shapeName;
    const coords = getRegionCoords(regionName);
    if (tanzaniaRegions.find(r => r.name === regionName)) {
      layer.on({
        mouseover: () => {
          const avgValue = sheetData
            .filter(row => row.ADM1_NAME === regionName)
            .reduce((sum, row) => sum + (parseFloat(row[dataColumn]) || 0), 0) / sheetData.filter(row => row.ADM1_NAME === regionName).length;
          onHover({ 
            title: regionName, 
            data: avgValue.toFixed(2), 
            isDistrict: false,
            dataColumn: dataColumn,
            lat: coords.lat,
            lng: coords.lng
          });
        },
        mouseout: onHoverLeave,
        click: () => {}, // Handled in sidebar
      });
    }
  }, [dataColumn, sheetData, onHover, onHoverLeave]);  // Depend on dataColumn

  // ADM2 onEachFeature (useCallback to recreate on dataColumn change)
  const onEachAdm2 = useCallback((feature, layer) => {
    const districtName = feature.properties?.shapeName;
    let regionName = null;
    for (const r of tanzaniaRegions) {
      if (r.districts.some(d => d.name === districtName)) {
        regionName = r.name;
        break;
      }
    }
    if (regionName) {
      const coords = getDistrictCoords(districtName, regionName);
      layer.on({
        mouseover: () => {
          const row = sheetData.find(r => r.ADM2_NAME === districtName && r.ADM1_NAME === regionName);
          onHover({ 
            title: districtName, 
            data: row ? row[dataColumn] : 'No data', 
            isDistrict: true, 
            region: regionName,
            dataColumn: dataColumn,
            lat: coords.lat,
            lng: coords.lng
          });
        },
        mouseout: onHoverLeave,
        click: () => {}, // Handled in sidebar
      });
    }
  }, [dataColumn, sheetData, onHover, onHoverLeave]);  // Depend on dataColumn

  // ADM1 style (average-based) - recreated on each call
  const adm1Style = useCallback((feature) => {
    const regionName = feature.properties?.shapeName;
    const avgValue = sheetData
      .filter(row => row.ADM1_NAME === regionName)
      .reduce((sum, row) => sum + (parseFloat(row[dataColumn]) || 0), 0) / sheetData.filter(row => row.ADM1_NAME === regionName).length;
    const isSelected = selectedRegion?.name === regionName;
    return getStyleForFeature(avgValue, dataType, colorScale, isSelected, true); // true for region (fainter)
  }, [sheetData, dataColumn, selectedRegion, dataType, colorScale]);

  // ADM2 style (direct) - recreated on each call
  const adm2Style = useCallback((feature) => {
    const districtName = feature.properties?.shapeName;
    let regionName = null;
    for (const r of tanzaniaRegions) {
      if (r.districts.some(d => d.name === districtName)) {
        regionName = r.name;
        break;
      }
    }
    const row = regionName ? sheetData.find(r => r.ADM2_NAME === districtName && r.ADM1_NAME === regionName) : null;
    const value = row ? row[dataColumn] : null;
    const isSelected = selectedDistrict?.name === districtName;
    return getStyleForFeature(value, dataType, colorScale, isSelected, false); // false for district (stronger)
  }, [sheetData, dataColumn, selectedDistrict, dataType, colorScale]);

  // Markers
  const getRegionIcon = () => {
    const content = `📍<br/><strong>${selectedRegion.name}</strong><br/>Avg ${dataColumn}: ${regionData?.avgValue || 'N/A'}<br/>Dists: ${regionData?.count || 0}`;
    return divIcon({ html: `<div class="custom-marker">${content}</div>`, className: 'custom-div-icon', iconSize: null, iconAnchor: [0, 0] });
  };

  const getDistrictIcon = () => {
    const content = `📍<br/><strong>${selectedDistrict.name}</strong><br/>${dataColumn}: ${districtData?.displayValue || 'N/A'}`;
    return divIcon({ html: `<div class="custom-marker">${content}</div>`, className: 'custom-div-icon', iconSize: null, iconAnchor: [0, 0] });
  };

  return (
    <div className="map-display-container">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        maxBounds={tanzaniaBounds}  // Restrict to Tanzania
        maxBoundsViscosity={1.0}   // "Sticky" bounds
        minZoom={5}
        maxZoom={10}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        <GeoJSON 
          key={`adm1-${dataColumn}`}  // Force re-mount on column change
          data={adm1GeoJson} 
          style={adm1Style} 
          onEachFeature={onEachAdm1} 
        />
        <GeoJSON 
          key={`adm2-${dataColumn}`}  // Force re-mount on column change
          data={adm2GeoJson} 
          style={adm2Style} 
          onEachFeature={onEachAdm2} 
        />
        {selectedRegion && !selectedDistrict && selectedRegion.lat && selectedRegion.lng && (
          <Marker position={[selectedRegion.lat, selectedRegion.lng]} icon={getRegionIcon()} />
        )}
        {selectedDistrict && selectedDistrict.lat && selectedDistrict.lng && (
          <Marker position={[selectedDistrict.lat, selectedDistrict.lng]} icon={getDistrictIcon()} />
        )}
        {/* Legend (Key) - Top Right */}
        <Legend dataType={dataType} colorScale={colorScale} dataColumn={dataColumn} />
        {/* Scale - Bottom Right */}
        <ScaleControl position="bottomright" imperial={false} metric={true} />
      </MapContainer>
      <div className="map-attribution">
        <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">View Larger Map</a><br />
        Boundaries: <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener noreferrer">geoBoundaries</a>
      </div>
    </div>
  );
}

export default MapDisplay;