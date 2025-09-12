// Updated VisualizationModal.jsx
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { 
  getAllColumns, 
  getNumericColumns, 
  transformDataForVisualization,
  aggregateData,
  getUniqueValues,
  isConvertibleToNumber,
  convertToNumberIfPossible
} from '../utils/dataTransform';
import './VisualizationModal.css';

// Register a simple world map (mock data)
const registerWorldMap = () => {
  try {
    // Try to get the registered map first
    if (!echarts.getMap('world')) {
      // Register a simple world map with minimal data
      echarts.registerMap('world', {
        type: 'FeatureCollection',
        features: [
          // Add a few sample countries
          {
            type: 'Feature',
            properties: { name: 'United States' },
            geometry: { type: 'Point', coordinates: [-95.7129, 37.0902] }
          },

          {
            type: 'Feature',
            properties: { name: 'Tanzania' },
            geometry: { type: 'Point', coordinates: [34.8888, -6.3690] }
          },
          {
            type: 'Feature',
            properties: { name: 'Africa' },
            geometry: { type: 'Point', coordinates: [21.7587, 1.3733] }
          },
          {
            type: 'Feature',
            properties: { name: 'Canada' },
            geometry: { type: 'Point', coordinates: [-106.3468, 56.1304] }
          },
          {
            type: 'Feature',
            properties: { name: 'United Kingdom' },
            geometry: { type: 'Point', coordinates: [-3.4360, 55.3781] }
          },
          {
            type: 'Feature',
            properties: { name: 'Germany' },
            geometry: { type: 'Point', coordinates: [10.4515, 51.1657] }
          },
          {
            type: 'Feature',
            properties: { name: 'France' },
            geometry: { type: 'Point', coordinates: [2.2137, 46.2276] }
          },
          {
            type: 'Feature',
            properties: { name: 'Australia' },
            geometry: { type: 'Point', coordinates: [133.7751, -25.2744] }
          },
          {
            type: 'Feature',
            properties: { name: 'Japan' },
            geometry: { type: 'Point', coordinates: [138.2529, 36.2048] }
          },
          {
            type: 'Feature',
            properties: { name: 'China' },
            geometry: { type: 'Point', coordinates: [104.1954, 35.8617] }
          },
          {
            type: 'Feature',
            properties: { name: 'India' },
            geometry: { type: 'Point', coordinates: [78.9629, 20.5937] }
          },
          {
            type: 'Feature',
            properties: { name: 'Brazil' },
            geometry: { type: 'Point', coordinates: [-53.2, -10.3333] }
          }
        ]
      });
    }
  } catch (error) {
    console.error('Failed to register world map:', error);
  }
};

// Call this function to register the map
registerWorldMap();

function VisualizationModal({ data, columns, isOpen, onClose, chartType: initialChartType }) {
  const [chartType, setChartType] = useState(initialChartType || 'bar');
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [aggregationType, setAggregationType] = useState('sum');
  const [chartData, setChartData] = useState([]);
  const [title, setTitle] = useState('');
  const [numericColumns, setNumericColumns] = useState([]);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    console.log("Modal received columns:", columns);
    console.log("Modal received data:", data);
    
    if (columns && columns.length > 0) {
      setXAxisColumn(columns[0]);
      
      // Find numeric columns for Y-axis
      const numericCols = getNumericColumns(data);
      setNumericColumns(numericCols);
      
      if (numericCols.length > 0) {
        setYAxisColumn(numericCols[0]);
      } else if (columns.length > 1) {
        setYAxisColumn(columns[1]);
      }
    }
  }, [columns, data]);

  useEffect(() => {
    if (xAxisColumn && yAxisColumn && data && data.length > 0) {
      updateChartData();
    }
  }, [xAxisColumn, yAxisColumn, data, chartType, aggregationType]);

  const updateChartData = () => {
    try {
      let transformedData = [];
      let chartTitle = `${yAxisColumn} by ${xAxisColumn}`;
      
      if (chartType === 'map') {
        // For map charts, we need special handling
        transformedData = data.map(item => ({
          name: item[xAxisColumn] || '',
          value: isConvertibleToNumber(item[yAxisColumn]) ? 
                convertToNumberIfPossible(item[yAxisColumn]) : 0
        })).filter(item => item.name && item.name !== '');
        
        chartTitle = `${yAxisColumn} Distribution`;
        
        // Check if we have valid map data
        if (!echarts.getMap('world')) {
          setMapError(true);
        } else {
          setMapError(false);
        }
      } else if (['pie', 'bar', 'line', 'scatter'].includes(chartType)) {
        // For standard charts, use aggregation if needed
        if (aggregationType !== 'none' && !isConvertibleToNumber(data[0][xAxisColumn])) {
          transformedData = aggregateData(data, xAxisColumn, yAxisColumn, aggregationType);
          chartTitle = `${aggregationType} of ${yAxisColumn} by ${xAxisColumn}`;
        } else {
          transformedData = transformDataForVisualization(data, xAxisColumn, yAxisColumn);
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
          // Fallback to scatter chart if map is not available
          return {
            ...baseOption,
            title: {
              ...baseOption.title,
              text: `${title} (Map not available - using scatter plot)`
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
              type: 'scatter',
              symbolSize: (value) => Math.min(30, 10 + value / 10),
              itemStyle: {
                color: '#fac858'
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
            map: 'world',
            emphasis: {
              label: {
                show: true
              }
            },
            data: chartData
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
            Showing a scatter plot instead. For full map support, you would need to 
            load proper GeoJSON data for the world map.
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
      </div>
    </div>
  );
}

export default VisualizationModal;