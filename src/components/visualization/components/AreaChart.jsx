import React from 'react';
import ReactECharts from 'echarts-for-react';

function AreaChart({ chartData, title, xAxisColumn, yAxisColumn }) {
  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}'
    },
    toolbox: {
      feature: {
        saveAsImage: { title: 'Save as Image' }
      }
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
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: '#91cc75'
          }, {
            offset: 1, color: 'rgba(145, 204, 117, 0.1)'
          }]
        }
      },
      itemStyle: {
        color: '#91cc75'
      }
    }]
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '300px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

export default AreaChart;