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
import BarChart from './BarChart';
import LineChart from './LineChart';
import ScatterChart from './ScatterChart';
import AreaChart from './AreaChart';
import PieChart from './PieChart';
import HeatMap from './HeatMap';
import MapChart from './MapChart/MapChart';
import DashboardView from './DashboardView';
import './VisualizationModal.css';

function VisualizationModal({ data, columns, isOpen, onClose, chartType: initialChartType }) {
  const [currentView, setCurrentView] = useState(initialChartType || 'dashboard');
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [aggregationType, setAggregationType] = useState('sum');
  const [chartData, setChartData] = useState([]);
  const [title, setTitle] = useState('');
  const [numericColumns, setNumericColumns] = useState([]);
  const [allColumns, setAllColumns] = useState([]);

  useEffect(() => {
    if (columns && columns.length > 0) {
      const cols = getAllColumns(data);
      setAllColumns(cols);
      setXAxisColumn(cols[0]);
      
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
    if (xAxisColumn && yAxisColumn && data && data.length > 0 && currentView !== 'dashboard' && currentView !== 'map') {
      updateChartData();
    }
  }, [xAxisColumn, yAxisColumn, data, currentView, aggregationType]);

  const updateChartData = () => {
    try {
      let transformedData = [];
      let chartTitle = `${yAxisColumn} by ${xAxisColumn}`;
      
      if (aggregationType !== 'none' && !isConvertibleToNumber(data[0][xAxisColumn])) {
        transformedData = aggregateData(data, xAxisColumn, yAxisColumn, aggregationType);
        chartTitle = `${aggregationType} of ${yAxisColumn} by ${xAxisColumn}`;
      } else {
        transformedData = transformDataForVisualization(data, xAxisColumn, yAxisColumn);
      }
      
      setChartData(transformedData);
      setTitle(chartTitle);
    } catch (error) {
      console.error("Error updating chart data:", error);
    }
  };

  const handleViewChart = (chartType, xCol, yCol, aggType) => {
    setCurrentView(chartType);
    if (xCol) setXAxisColumn(xCol);
    if (yCol) setYAxisColumn(yCol);
    if (aggType) setAggregationType(aggType);
  };

  const handleViewMap = () => {
    setCurrentView('map');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const getChartComponent = () => {
    if (currentView === 'map') {
      return (
        <div className="single-chart-view">
          <div className="chart-header">
            <button className="back-btn" onClick={handleBackToDashboard}>
              ← Back to Dashboard
            </button>
            <h3>🗺️ Tanzania Map</h3>
          </div>
          <MapChart sheetData={data} />
        </div>
      );
    }

    if (currentView === 'dashboard') {
      return (
        <DashboardView
          data={data}
          columns={allColumns}
          isOpen={true}
          onClose={onClose}
          onViewChart={handleViewChart}
          onViewMap={handleViewMap}
        />
      );
    }

    const props = {
      chartData,
      title,
      xAxisColumn,
      yAxisColumn
    };

    const chartComponents = {
      'bar': BarChart,
      'line': LineChart,
      'scatter': ScatterChart,
      'area': AreaChart,
      'pie': PieChart,
      'heatmap': HeatMap
    };

    const ChartComponent = chartComponents[currentView] || BarChart;

    return (
      <div className="single-chart-view">
        <div className="chart-header">
          <button className="back-btn" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
        <ChartComponent {...props} />
      </div>
    );
  };

  if (!isOpen) return null;

  // If it's dashboard or single chart view, render accordingly
  if (currentView === 'dashboard') {
    return getChartComponent();
  }

  return (
    <div className="visualization-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>✨ Data Visualization</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {currentView !== 'map' && currentView !== 'dashboard' && (
          <ChartControls
            chartType={currentView}
            handleChartTypeChange={setCurrentView}
            xAxisColumn={xAxisColumn}
            setXAxisColumn={setXAxisColumn}
            yAxisColumn={yAxisColumn}
            setYAxisColumn={setYAxisColumn}
            aggregationType={aggregationType}
            setAggregationType={setAggregationType}
            columns={allColumns}
            numericColumns={numericColumns}
            showAggregation={currentView !== 'map'}
          />
        )}
        
        <div className="chart-container">
          {getChartComponent()}
        </div>
      </div>
    </div>
  );
}

export default VisualizationModal;