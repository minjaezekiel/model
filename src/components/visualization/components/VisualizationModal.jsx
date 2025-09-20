import React, { useState, useEffect } from 'react';
import { 
  getNumericColumns,
  isConvertibleToNumber,
  convertToNumberIfPossible,
  aggregateData,
  transformDataForVisualization
} from '../../../utils/dataTransform';
import ChartControls from './ChartControls';
import DataPreview from './DataPreview';
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ScatterChart from './ScatterChart';
import MapChart from './MapChart/MapChart';
import './VisualizationModal.css';

function VisualizationModal({ data, columns, isOpen, onClose, chartType: initialChartType }) {
  const [chartType, setChartType] = useState(initialChartType || 'bar');
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [aggregationType, setAggregationType] = useState('sum');
  const [chartData, setChartData] = useState([]);
  const [title, setTitle] = useState('');
  const [numericColumns, setNumericColumns] = useState([]);

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
    if (xAxisColumn && yAxisColumn && data && data.length > 0 && chartType !== 'map') {
      updateChartData();
    }
  }, [xAxisColumn, yAxisColumn, data, chartType, aggregationType]);

  const updateChartData = () => {
    try {
      let transformedData = [];
      let chartTitle = `${yAxisColumn} by ${xAxisColumn}`;
      
      // For standard charts, use aggregation if needed
      if (aggregationType !== 'none' && !isConvertibleToNumber(data[0][xAxisColumn])) {
        transformedData = aggregateData(data, xAxisColumn, yAxisColumn, aggregationType);
        chartTitle = `${aggregationType} of ${yAxisColumn} by ${xAxisColumn}`;
      } else {
        transformedData = transformDataForVisualization(data, xAxisColumn, yAxisColumn);
      }
      
      setChartData(transformedData);
      setTitle(chartTitle);
      console.log("Chart data transformed:", transformedData);
    } catch (error) {
      console.error("Error updating chart data:", error);
    }
  };

  const handleChartTypeChange = (newChartType) => {
    setChartType(newChartType);
  };

  const getChartComponent = () => {
    const props = {
      chartData,
      title,
      xAxisColumn,
      yAxisColumn
    };

    switch (chartType) {
      case 'bar':
        return <BarChart {...props} />;
      case 'line':
        return <LineChart {...props} />;
      case 'pie':
        return <PieChart {...props} />;
      case 'scatter':
        return <ScatterChart {...props} />;
      case 'map':
        // For map, we show the standalone Tanzania map
        return <MapChart />;
      default:
        return <BarChart {...props} />;
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
        
        {chartType !== 'map' && (
          <ChartControls
            chartType={chartType}
            handleChartTypeChange={handleChartTypeChange}
            xAxisColumn={xAxisColumn}
            setXAxisColumn={setXAxisColumn}
            yAxisColumn={yAxisColumn}
            setYAxisColumn={setYAxisColumn}
            aggregationType={aggregationType}
            setAggregationType={setAggregationType}
            columns={columns}
          />
        )}
        
        {chartType !== 'map' && (
          <DataPreview 
            chartData={chartData}
            xAxisColumn={xAxisColumn}
            yAxisColumn={yAxisColumn}
          />
        )}
        
        <div className="chart-container">
          {chartType === 'map' || chartData.length > 0 ? (
            getChartComponent()
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