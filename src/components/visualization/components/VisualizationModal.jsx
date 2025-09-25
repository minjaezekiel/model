import React, { useState, useEffect } from 'react';
import { 
  getNumericColumns,
  isConvertibleToNumber,
  convertToNumberIfPossible,
  aggregateData,
  transformDataForVisualization,
  getAllColumns
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
  const [allColumns, setAllColumns] = useState([]);

  useEffect(() => {
    console.log("Modal received columns:", columns);
    console.log("Modal received data:", data);
    
    if (columns && columns.length > 0) {
      const cols = getAllColumns(data);
      setAllColumns(cols);
      setXAxisColumn(cols[0]);
      
      // Find numeric columns for Y-axis
      const numericCols = getNumericColumns(data);
      setNumericColumns(numericCols);
      
      if (numericCols.length > 0) {
        setYAxisColumn(numericCols[0]);
      } else if (cols.length > 1) {
        setYAxisColumn(cols[1]);
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
    if (chartType === 'map') {
      return <MapChart sheetData={data} />;
    }

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
        
        <ChartControls
          chartType={chartType}
          handleChartTypeChange={handleChartTypeChange}
          xAxisColumn={xAxisColumn}
          setXAxisColumn={setXAxisColumn}
          yAxisColumn={yAxisColumn}
          setYAxisColumn={setYAxisColumn}
          aggregationType={aggregationType}
          setAggregationType={setAggregationType}
          columns={allColumns}
          numericColumns={numericColumns}
          showAggregation={chartType !== 'map'}
        />
        
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