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
    const classes = 5; // Green to Red
    return {
      type: 'numerical',
      scale: { min, max, classes, colors: ['#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#F44336'] }
    };
  } else {
    // Categorical mapping (extend as needed based on Excel)
    return {
      type: 'categorical',
      scale: {
        mappings: {
          low: '#00e908ff', no: '#00e708ff', available: '#00c907ff',
          medium: '#eed600ff', moderate: '#f0d800ff',
          high: '#FF9800', extreme: '#f01000ff', 'very high': '#ff1100ff',
          yes: '#013cffff',
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