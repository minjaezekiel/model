// VisualizationModal.jsx
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import './VisualizationModal.css';

function VisualizationModal({ data, columns, isOpen, onClose, chartType: initialChartType }) {
  const [chartType, setChartType] = useState(initialChartType || 'bar');
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [chartData, setChartData] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (columns && columns.length > 0) {
      setXAxisColumn(columns[0]);
      // Try to find a numeric column for Y axis
      const numericColumn = columns.find(col => 
        data.some(item => !isNaN(parseFloat(item[col])))
      );
      if (numericColumn) {
        setYAxisColumn(numericColumn);
      } else if (columns.length > 1) {
        setYAxisColumn(columns[1]);
      }
    }
  }, [columns, data]);

  useEffect(() => {
    if (xAxisColumn && yAxisColumn && data.length > 0) {
      const transformedData = data.map(item => ({
        name: item[xAxisColumn] || '',
        value: !isNaN(parseFloat(item[yAxisColumn])) ? parseFloat(item[yAxisColumn]) : 0
      })).filter(item => item.name !== undefined && item.name !== null);
      
      setChartData(transformedData);
      setTitle(`${yAxisColumn} by ${xAxisColumn}`);
    }
  }, [xAxisColumn, yAxisColumn, data]);

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
        trigger: 'axis',
        formatter: '{b}: {c}'
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
      
      default:
        return baseOption;
    }
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
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
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
        </div>
        
        <div className="chart-container">
          {chartData.length > 0 ? (
            <ReactECharts
              option={getChartOption()}
              style={{ height: '400px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          ) : (
            <div className="no-data">No data available for visualization</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisualizationModal;