// VisualizationModal.jsx - Enhanced with GIS integration
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { 
  getNumericColumns, 
  isConvertibleToNumber,
  convertToNumberIfPossible
} from '../utils/dataTransform';
import './VisualizationModal.css';

// Tanzania-specific GIS data (simplified for example)
const tanzaniaRegionsGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Dodoma", code: "TZ01" },
      geometry: {
        type: "Polygon",
        coordinates: [[[35.5, -7.0], [36.5, -7.0], [36.5, -6.0], [35.5, -6.0], [35.5, -7.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Arusha", code: "TZ02" },
      geometry: {
        type: "Polygon",
        coordinates: [[[36.0, -4.0], [37.0, -4.0], [37.0, -3.0], [36.0, -3.0], [36.0, -4.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kilimanjaro", code: "TZ03" },
      geometry: {
        type: "Polygon",
        coordinates: [[[37.0, -4.0], [38.0, -4.0], [38.0, -3.0], [37.0, -3.0], [37.0, -4.0]]]
      }
    },
    // Add more regions with proper coordinates in a real implementation
  ]
};

// Register Tanzania map
const registerTanzaniaMap = () => {
  try {
    if (!echarts.getMap('tanzania')) {
      echarts.registerMap('tanzania', tanzaniaRegionsGeoJSON);
    }
  } catch (error) {
    console.error('Failed to register Tanzania map:', error);
  }
};

// Call this function to register the map
registerTanzaniaMap();

function VisualizationModal({ data, columns, isOpen, onClose, chartType: initialChartType }) {
  const [chartType, setChartType] = useState(initialChartType || 'bar');
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [aggregationType, setAggregationType] = useState('sum');
  const [chartData, setChartData] = useState([]);
  const [title, setTitle] = useState('');
  const [numericColumns, setNumericColumns] = useState([]);
  const [mapError, setMapError] = useState(false);
  const [gisLevel, setGisLevel] = useState('region'); // 'country', 'region', 'district'

  useEffect(() => {
    console.log("Modal received columns:", columns);
    console.log("Modal received data:", data);
    
    if (columns && columns.length > 0) {
      // Set appropriate default columns based on data structure
      const regionCol = columns.find(col => col.toLowerCase().includes('region')) || columns[1];
      const districtCol = columns.find(col => col.toLowerCase().includes('district')) || columns[2];
      const codeCol = columns.find(col => col.toLowerCase().includes('code') && col.length === 4) || columns[4];
      
      setXAxisColumn(regionCol || columns[0]);
      
      // Find numeric columns for Y-axis
      const numericCols = getNumericColumns(data);
      setNumericColumns(numericCols);
      
      if (numericCols.length > 0) {
        setYAxisColumn(numericCols[0]);
      } else if (columns.length > 1) {
        setYAxisColumn(columns[columns.length - 1]); // Use last column as default
      }
    }
  }, [columns, data]);

  useEffect(() => {
    if (xAxisColumn && yAxisColumn && data && data.length > 0) {
      updateChartData();
    }
  }, [xAxisColumn, yAxisColumn, data, chartType, aggregationType, gisLevel]);

  const updateChartData = () => {
    try {
      let transformedData = [];
      let chartTitle = `${yAxisColumn} by ${xAxisColumn}`;
      
      if (chartType === 'map') {
        // For Tanzania map charts, aggregate by region code
        const regionDataMap = {};
        
        data.forEach(item => {
          // Use region code if available, otherwise use region name
          const regionCode = item['Region Code'] || item[xAxisColumn];
          const regionName = item[xAxisColumn];
          const value = isConvertibleToNumber(item[yAxisColumn]) ? 
                       convertToNumberIfPossible(item[yAxisColumn]) : 0;
          
          if (gisLevel === 'region') {
            // Aggregate by region
            if (!regionDataMap[regionCode]) {
              regionDataMap[regionCode] = {
                name: regionName,
                value: 0,
                code: regionCode,
                region: regionName
              };
            }
            regionDataMap[regionCode].value += value;
          } else if (gisLevel === 'district') {
            // For district-level data (would need more detailed GeoJSON)
            const districtCode = item['District Code'] || regionCode;
            const districtName = item['District'] || regionName;
            
            if (!regionDataMap[districtCode]) {
              regionDataMap[districtCode] = {
                name: districtName,
                value: 0,
                code: districtCode,
                region: regionName
              };
            }
            regionDataMap[districtCode].value += value;
          }
        });
        
        transformedData = Object.values(regionDataMap);
        chartTitle = `${yAxisColumn} by ${gisLevel === 'region' ? 'Region' : 'District'}`;
        
        // Check if we have valid map data
        if (!echarts.getMap('tanzania')) {
          setMapError(true);
        } else {
          setMapError(false);
        }
      } else {
        // For standard charts
        if (aggregationType !== 'none') {
          // Aggregate data by region
          const regionDataMap = {};
          
          data.forEach(item => {
            const regionName = item[xAxisColumn];
            const value = isConvertibleToNumber(item[yAxisColumn]) ? 
                         convertToNumberIfPossible(item[yAxisColumn]) : 0;
            
            if (!regionDataMap[regionName]) {
              regionDataMap[regionName] = {
                name: regionName,
                value: 0
              };
            }
            
            if (aggregationType === 'sum') {
              regionDataMap[regionName].value += value;
            } else if (aggregationType === 'average') {
              // For average, we'd need to track count as well
              regionDataMap[regionName].value = 
                (regionDataMap[regionName].value + value) / (regionDataMap[regionName].count || 1);
              regionDataMap[regionName].count = (regionDataMap[regionName].count || 0) + 1;
            } else if (aggregationType === 'count') {
              regionDataMap[regionName].value += 1;
            } else if (aggregationType === 'max') {
              regionDataMap[regionName].value = Math.max(regionDataMap[regionName].value, value);
            } else if (aggregationType === 'min') {
              regionDataMap[regionName].value = Math.min(regionDataMap[regionName].value, value);
            }
          });
          
          transformedData = Object.values(regionDataMap);
        } else {
          // No aggregation - use raw data
          transformedData = data.map(item => ({
            name: item[xAxisColumn],
            value: isConvertibleToNumber(item[yAxisColumn]) ? 
                  convertToNumberIfPossible(item[yAxisColumn]) : 0
          }));
        }
        
        setMapError(false);
      }
      
      setChartData(transformedData);
      setTitle(chartTitle);
      console.log("Chart data transformed:", transformedData);
    } catch (error) {
      console.error("Error updating chart data:", error);
    }
  };

  const getChartOption = () => {
    const baseOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: chartType === 'map' ? 'item' : 'axis',
        formatter: chartType === 'map' ? '{b}: {c}' : '{b}: {c}'
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save as Image' },
          dataView: { title: 'Data View', readOnly: true }
        }
      }
    };

    switch (chartType) {
      case 'bar':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: chartData.map(item => item.name),
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: chartData.map(item => item.value),
            type: 'bar',
            itemStyle: {
              color: '#5470c6'
            }
          }]
        };
      
      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: chartData.map(item => item.name),
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: chartData.map(item => item.value),
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#91cc75'
            }
          }]
        };
      
      case 'pie':
        return {
          ...baseOption,
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          series: [{
            name: title,
            type: 'pie',
            radius: '70%',
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };
      
      case 'scatter':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: chartData.map(item => item.name),
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: chartData.map(item => item.value),
            type: 'scatter',
            symbolSize: (value) => Math.min(30, 10 + value / 10),
            itemStyle: {
              color: '#fac858'
            }
          }]
        };
      
      case 'map':
        if (mapError) {
          // Fallback to bar chart if map is not available
          return {
            ...baseOption,
            title: {
              ...baseOption.title,
              text: `${title} (Map not available - using bar chart)`
            },
            xAxis: {
              type: 'category',
              data: chartData.map(item => item.name),
              axisLabel: {
                rotate: 45
              }
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              data: chartData.map(item => item.value),
              type: 'bar',
              itemStyle: {
                color: '#5470c6'
              }
            }]
          };
        }
        
        return {
          ...baseOption,
          visualMap: {
            min: Math.min(...chartData.map(item => item.value)),
            max: Math.max(...chartData.map(item => item.value)),
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027']
            }
          },
          series: [{
            name: title,
            type: 'map',
            map: 'tanzania',
            roam: true, // Enable zoom and pan
            emphasis: {
              label: {
                show: true
              }
            },
            data: chartData,
            nameMap: {
              // Map your region names to GeoJSON names if needed
              'Dodoma Urban': 'Dodoma',
              'Arusha Urban': 'Arusha',
              'Moshi Urban': 'Moshi'
            }
          }]
        };
      
      default:
        return baseOption;
    }
  };

  const handleChartTypeChange = (newChartType) => {
    setChartType(newChartType);
    setMapError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="visualization-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Data Visualization</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="controls">
          <div className="control-group">
            <label>Chart Type:</label>
            <select 
              value={chartType} 
              onChange={(e) => handleChartTypeChange(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="map">Map Chart</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>X-Axis (Category):</label>
            <select 
              value={xAxisColumn} 
              onChange={(e) => setXAxisColumn(e.target.value)}
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Y-Axis (Value):</label>
            <select 
              value={yAxisColumn} 
              onChange={(e) => setYAxisColumn(e.target.value)}
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          {chartType === 'map' && (
            <div className="control-group">
              <label>GIS Level:</label>
              <select 
                value={gisLevel} 
                onChange={(e) => setGisLevel(e.target.value)}
              >
                <option value="region">By Region</option>
                <option value="district">By District</option>
              </select>
            </div>
          )}
          
          {(chartType === 'bar' || chartType === 'pie') && (
            <div className="control-group">
              <label>Aggregation:</label>
              <select 
                value={aggregationType} 
                onChange={(e) => setAggregationType(e.target.value)}
              >
                <option value="none">None</option>
                <option value="sum">Sum</option>
                <option value="average">Average</option>
                <option value="count">Count</option>
                <option value="max">Maximum</option>
                <option value="min">Minimum</option>
              </select>
            </div>
          )}
        </div>
        
        {mapError && (
          <div className="map-warning">
            <strong>Note:</strong> Full map visualization is not available. 
            Showing a bar chart instead. For full map support, you would need to 
            load proper GeoJSON data for Tanzania regions.
          </div>
        )}
        
        <div className="data-preview">
          <h3>Data Preview (First 5 rows)</h3>
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  <th>{xAxisColumn}</th>
                  <th>{yAxisColumn}</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="chart-container">
          {chartData.length > 0 ? (
            <ReactECharts
              option={getChartOption()}
              style={{ height: '400px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          ) : (
            <div className="no-data">
              <p>No data available for visualization</p>
              <p>Please check your column selections and ensure your data contains values</p>
            </div>
          )}
        </div>
        
        {chartType === 'map' && (
          <div className="gis-info">
            <h4>GIS Integration Notes:</h4>
            <ul>
              <li>The map shows Tanzania regions with your data values</li>
              <li>Hover over regions to see detailed values</li>
              <li>Use mouse wheel to zoom in/out</li>
              <li>Drag to pan around the map</li>
              <li>For more accurate maps, consider using professional GIS data sources</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualizationModal;