import React from 'react';
import { getColorForValue } from './utils';
import './MapChart.css';

function Sidebar({ regions, expandedRegion, selectedRegion, selectedDistrict, onRegionClick, onDistrictClick, onHover, onHoverLeave, sheetData, dataColumn, dataType, colorScale }) {
  const handleRegionMouseEnter = (region) => {
    if (sheetData.length > 0 && dataColumn) {
      const regionRows = sheetData.filter(row => row.ADM1_NAME === region.name);
      const avgValue = regionRows.reduce((sum, row) => sum + (parseFloat(row[dataColumn]) || 0), 0) / regionRows.length;
      onHover({ 
        title: region.name, 
        data: avgValue.toFixed(2), 
        isDistrict: false,
        dataColumn: dataColumn  // Added for popup label
      });
    } else {
      onHover({ 
        title: region.name, 
        data: 'No data', 
        isDistrict: false,
        dataColumn: dataColumn  // Added for popup label
      });
    }
  };

  const handleDistrictMouseEnter = (district, regionName) => {
    if (sheetData.length > 0 && dataColumn) {
      const row = sheetData.find(r => r.ADM2_NAME === district.name && r.ADM1_NAME === regionName);
      onHover({ 
        title: district.name, 
        data: row ? row[dataColumn] : 'No data', 
        isDistrict: true, 
        region: regionName,
        dataColumn: dataColumn  // Added for popup label
      });
    } else {
      onHover({ 
        title: district.name, 
        data: 'No data', 
        isDistrict: true, 
        region: regionName,
        dataColumn: dataColumn  // Added for popup label
      });
    }
  };

  return (
    <div className="sidebar-container">
      <h3>Tanzania Regions</h3>
      <div className="regions-list">
        {regions.map(region => (
          <div key={region.name}>
            <div
              className={`region-item ${selectedRegion?.name === region.name ? 'selected' : ''}`}
              style={{ borderLeft: `4px solid ${getColorForValue(null, dataType, colorScale)}` }} // Default color
              onClick={() => onRegionClick(region)}
              onMouseEnter={() => handleRegionMouseEnter(region)}
              onMouseLeave={onHoverLeave}
            >
              {region.name}
              <span className="toggle-icon">{expandedRegion === region.name ? '−' : '+'}</span>
            </div>
            {expandedRegion === region.name && (
              <div className="districts-container">
                <div className="districts-list">
                  {region.districts.map(district => {
                    const row = sheetData.find(r => r.ADM2_NAME === district.name && r.ADM1_NAME === region.name);
                    const value = row ? row[dataColumn] : null;
                    const color = getColorForValue(value, dataType, colorScale);
                    return (
                      <div
                        key={district.name}
                        className={`district-item ${selectedDistrict?.name === district.name ? 'selected' : ''}`}
                        style={{ borderLeft: `4px solid ${color}` }}
                        onClick={() => onDistrictClick(district)}
                        onMouseEnter={() => handleDistrictMouseEnter(district, region.name)}
                        onMouseLeave={onHoverLeave}
                      >
                        {district.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;