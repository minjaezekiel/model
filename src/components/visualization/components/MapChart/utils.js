// Utility functions for data processing and coloring

// Detect if column is numerical or categorical
export const detectDataType = (sheetData, dataColumn) => {
  if (!sheetData.length || !dataColumn) return { type: 'categorical', scale: {} };

  const values = sheetData.map(row => row[dataColumn]).filter(v => v != null);
  const numericCount = values.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).length;
  const isNumerical = numericCount / values.length > 0.9; // >90% numeric

  if (isNumerical) {
    const nums = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const classes = 5; // 5 classes matching INFORM levels
    // Risk palette: Low (green) to High (red), shining/strong for visibility
    return {
      type: 'numerical',
      scale: { 
        min, 
        max, 
        classes, 
        colors: ['#047a3fff', '#038103ff', '#b99e03ff', '#a85e04ff', '#9e2c03ff'], // Very Low (bright green) -> Very High (vivid red)
        labels: ['Very Low', 'Low', 'Medium', 'High', 'Very High'] // For legend
      }
    };
  } else {
    // Categorical mapping (extended for INFORM risk terms)
    return {
      type: 'categorical',
      scale: {
        mappings: {
          'very low': '#00944aff', low: '#029402ff', no: '#039403ff', available: '#008f00ff',
          medium: '#a88f02ff', moderate: '#9c8503ff',
          high: '#965303ff', 'very high': '#972a03ff', extreme: '#491502ff',
          yes: '#005ca7ff',
          // Defaults
          default: '#9E9E9E'
        }
      }
    };
  }
};

// Get color for a value
export const getColorForValue = (value, dataType, scale) => {
  if (!value) return '#9E9E9E'; // Gray for null

  if (dataType === 'numerical') {
    const normalized = (parseFloat(value) - scale.min) / (scale.max - scale.min);
    const classIndex = Math.min(Math.floor(normalized * scale.classes), scale.classes - 1);
    return scale.colors[classIndex];
  } else {
    const strValue = String(value).toLowerCase().trim();
    const mapping = scale.mappings;
    for (const [key, color] of Object.entries(mapping)) {
      if (strValue.includes(key)) return color;
    }
    return mapping.default;
  }
};

// Get full style for a GeoJSON feature
export const getStyleForFeature = (value, dataType, scale, isSelected, isRegion = false) => {
  const baseColor = getColorForValue(value, dataType, scale);
  const fillOpacity = isSelected ? 0.7 : (isRegion ? 0.2 : 0.4); // Fainter for regions
  const color = isSelected ? '#1e3a8a' : baseColor;
  const weight = isSelected ? 3 : (isRegion ? 1 : 2);

  return {
    fillColor: baseColor,
    fillOpacity,
    color,
    weight,
  };
};