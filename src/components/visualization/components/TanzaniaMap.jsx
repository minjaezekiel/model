import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

// Tanzania geojson data (simplified)
const tanzaniaGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Tanzania"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [33.903711, -0.95],
            [34.07262, -1.05982],
            [37.69869, -3.09699],
            [37.7669, -3.67712],
            [39.20222, -4.67677],
            [38.74054, -5.90895],
            [38.79977, -6.47566],
            [39.44, -6.84],
            [39.47, -7.1],
            [39.19469, -7.7039],
            [39.25203, -8.00781],
            [39.18652, -8.48551],
            [39.53574, -9.11236],
            [39.9496, -10.0984],
            [40.31659, -10.3171],
            [39.521, -10.89688],
            [38.42756, -11.2852],
            [37.82764, -11.26879],
            [37.47129, -11.56876],
            [36.77515, -11.59454],
            [35.81868, -11.63697],
            [34.55999, -11.52002],
            [33.94084, -9.69367],
            [33.73972, -9.41715],
            [32.75938, -9.2306],
            [32.19186, -8.93036],
            [31.55634, -8.76204],
            [31.15775, -8.59458],
            [30.74, -8.34],
            [30.2, -7.08],
            [29.62, -6.52],
            [29.41999, -5.93998],
            [29.51999, -5.41998],
            [29.33999, -4.49998],
            [29.75351, -4.45239],
            [30.11632, -4.09012],
            [30.50554, -3.56858],
            [30.75224, -3.35931],
            [30.74301, -3.03431],
            [31.86617, -3.01636],
            [33.903711, -0.95]
          ]
        ]
      }
    }
  ]
};

// Register Tanzania map
try {
  echarts.registerMap('tanzania', tanzaniaGeoJSON);
} catch (error) {
  console.error('Failed to register Tanzania map:', error);
}

function TanzaniaMap() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapType, setMapType] = useState('tanzania');

  useEffect(() => {
    // Register Africa map if needed
    if (!echarts.getMap('africa')) {
      // This would normally be a proper Africa GeoJSON
      // For now, we'll just use a simple representation
      echarts.registerMap('africa', {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Africa' },
            geometry: { type: 'Point', coordinates: [20, 10] }
          }
        ]
      });
    }
  }, []);

  const handleZoom = (params) => {
    if (params.type === 'datazoom') {
      setZoomLevel(params.zoom);
      
      // Switch to Africa view when zoomed out enough
      if (params.zoom < 0.7) {
        setMapType('africa');
      } else {
        setMapType('tanzania');
      }
    }
  };

  const getOption = () => {
    if (mapType === 'africa') {
      return {
        title: {
          text: 'Africa Overview',
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
        },
        visualMap: {
          show: false
        },
        geo: {
          map: 'world',
          roam: true,
          zoom: 2,
          center: [20, 10],
          emphasis: {
            itemStyle: {
              areaColor: '#3673a5'
            },
            label: {
              show: true
            }
          },
          itemStyle: {
            areaColor: '#e7e8e9',
            borderColor: '#a1a1a1'
          }
        },
        series: [
          {
            name: 'Africa',
            type: 'map',
            map: 'world',
            data: [
              {name: 'Tanzania', value: 1, itemStyle: {areaColor: '#ff6b6b'}}
            ],
            emphasis: {
              label: {
                show: true
              }
            },
            zoom: 2,
            center: [20, 10]
          }
        ]
      };
    }

    // Tanzania detailed view
    return {
      title: {
        text: 'Tanzania Map',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}'
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save as Image' },
          restore: { title: 'Reset Zoom' }
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          type: 'slider',
          show: true,
          start: 0,
          end: 100
        }
      ],
      geo: {
        map: 'tanzania',
        roam: true,
        zoom: 4,
        center: [34.9, -6.4],
        emphasis: {
          itemStyle: {
            areaColor: '#3673a5'
          },
          label: {
            show: true
          }
        },
        itemStyle: {
          areaColor: '#4ea1db',
          borderColor: '#2d6187'
        }
      },
      series: [
        {
          name: 'Tanzania',
          type: 'map',
          map: 'tanzania',
          emphasis: {
            label: {
              show: true
            }
          },
          data: [
            {name: 'Tanzania', value: 1}
          ]
        }
      ]
    };
  };

  const onEvents = {
    datazoom: handleZoom
  };

  return (
    <div>
      <ReactECharts
        option={getOption()}
        style={{ height: '500px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={onEvents}
      />
      <div style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
        {mapType === 'tanzania' 
          ? 'Zoom out to see Africa view • Drag to pan • Use mouse wheel to zoom'
          : 'Zoom in to see Tanzania in detail'
        }
      </div>
    </div>
  );
}

export default TanzaniaMap;