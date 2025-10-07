import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const CustomLegend = ({ dataType, colorScale, dataColumn }) => {
  const map = useMap(); // Get map instance from react-leaflet context

  useEffect(() => {
    if (!map || !dataColumn || !L) return;

    // Remove existing legend if present
    if (map.legend) {
      map.removeControl(map.legend);
    }

    const legend = L.control({ position: 'topright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend-control');
      div.innerHTML = `
        <div class="legend-title">${dataColumn}</div>
        <div class="legend-body">
          ${generateLegendContent(dataType, colorScale)}
        </div>
      `;
      return div;
    };

    legend.addTo(map);
    map.legend = legend; // Store reference for removal

    return () => {
      if (map.legend) {
        map.removeControl(map.legend);
      }
    };
  }, [map, dataType, colorScale, dataColumn]);

  return null; // No DOM render; handled by Leaflet
};

// Helper to generate legend HTML based on type
const generateLegendContent = (dataType, scale) => {
  if (dataType === 'numerical') {
    const { min, max, classes, colors } = scale;
    if (!min || !max || !classes || !colors) return '<i style="background:gray"></i> No data';
    const step = (max - min) / classes;
    const labels = [];
    for (let i = 0; i < classes; i++) {
      const from = min + (i * step);
      const to = min + ((i + 1) * step);
      const label = i === 0 ? `< ${to.toFixed(1)}` : i === classes - 1 ? `≥ ${from.toFixed(1)}` : `${from.toFixed(1)} - ${to.toFixed(1)}`;
      labels.push(`<i style="background:${colors[i]}; opacity:0.7;"></i> ${label}`);
    }
    return labels.join('<br>');
  } else { // categorical
    const mappings = scale.mappings;
    if (!mappings) return '<i style="background:gray"></i> No data';
    const labels = Object.entries(mappings)
      .filter(([key]) => key !== 'default')
      .map(([key, color]) => `<i style="background:${color}; opacity:0.7;"></i> ${key.toUpperCase()}`)
      .join('<br>');
    return labels || '<i style="background:gray"></i> No categories';
  }
};

export default CustomLegend;