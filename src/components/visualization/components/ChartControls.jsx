import React from 'react';

function ChartControls({
  chartType,
  handleChartTypeChange,
  xAxisColumn,
  setXAxisColumn,
  yAxisColumn,
  setYAxisColumn,
  aggregationType,
  setAggregationType,
  columns
}) {
  return (
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
  );
}

export default ChartControls;