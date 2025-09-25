import React from 'react';
import ReactECharts from 'echarts-for-react';

function BarChart({ chartData, title, xAxisColumn, yAxisColumn }) {
  const option = {
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

  return (
    <ReactECharts
      option={option}
      style={{ height: '400px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}

export default BarChart;