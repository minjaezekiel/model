import React, { useState } from 'react';
import { tanzaniaRegions } from './tanzania-data';
import './MapChart.css';

function MapChart() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [expandedRegion, setExpandedRegion] = useState(null);

  const handleRegionClick = (region) => {
    if (expandedRegion === region.name) {
      setExpandedRegion(null);
      setSelectedRegion(null);
      setSelectedDistrict(null);
    } else {
      setExpandedRegion(region.name);
      setSelectedRegion(region);
      setSelectedDistrict(null);
    }
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
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

  return (
    <div className="map-chart-container">
      <div className="map-header">
        <h2>Interactive Map</h2>
        <p>Select a region and district to view on the map</p>
      </div>

      <div className="map-content">
        <div className="regions-sidebar">
          <h3>Tanzania Regions</h3>
          <div className="regions-list">
            {tanzaniaRegions.map(region => (
              <div key={region.name}>
                <div
                  className={`region-item ${selectedRegion?.name === region.name ? 'selected' : ''}`}
                  onClick={() => handleRegionClick(region)}
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
            src={getEmbedUrl()}
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

      {(selectedRegion || selectedDistrict) && (
        <div className="location-info">
          {selectedDistrict ? (
            <>
              <h3>{selectedDistrict.name} District</h3>
              <p>Region: {selectedRegion.name}</p>
              <p>Coordinates: {selectedDistrict.lat.toFixed(4)}, {selectedDistrict.lng.toFixed(4)}</p>
            </>
          ) : (
            <>
              <h3>{selectedRegion.name} Region</h3>
              <p>Coordinates: {selectedRegion.lat.toFixed(4)}, {selectedRegion.lng.toFixed(4)}</p>
              <p>Districts: {selectedRegion.districts.length}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MapChart;