// HeatMap.jsx
import React from 'react';
import ReactECharts from 'echarts-for-react';
import './ChartStyles.css';
import * as echarts from 'echarts';

function HeatMap({ chartData, title, xAxisColumn, yAxisColumn, isMiniature = false }) {
  // Transform data for heatmap - ensure we have valid data
  const heatmapData = chartData.map((item, index) => [
    index,
    0,
    item.value || 0
  ]);

  const maxValue = Math.max(...chartData.map(item => item.value || 0));
  
  // Ensure we have valid colors
  const heatmapColors = [
    '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8',
    '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
  ].filter(color => color && color !== 'undefined');

  const option = {
    title: isMiniature ? undefined : {
      text: `🔥 ${title}`,
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(44, 62, 80, 0.95)',
      borderColor: '#ff6b6b',
      borderWidth: 2,
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const item = chartData[params.data[0]];
        return `<strong>${item?.name || 'Unknown'}</strong><br/>Value: ${params.data[2] || 0}`;
      }
    },
    toolbox: isMiniature ? undefined : {
      feature: {
        saveAsImage: { 
          title: 'Save as Image',
          iconStyle: {
            borderColor: '#ff6b6b'
          }
        },
        dataView: { 
          title: 'Data View', 
          readOnly: true,
          iconStyle: {
            borderColor: '#ff6b6b'
          }
        }
      }
    },
    grid: {
      top: isMiniature ? '15%' : '20%',
      bottom: isMiniature ? '25%' : '15%',
      left: isMiniature ? '12%' : '10%',
      right: isMiniature ? '8%' : '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.name || 'Unknown'),
      axisLabel: {
        rotate: isMiniature ? 0 : 45,
        fontSize: isMiniature ? 10 : 12,
        color: '#495057'
      },
      axisLine: {
        lineStyle: {
          color: '#adb5bd'
        }
      },
      axisTick: {
        alignWithLabel: true
      },
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['Value'],
      axisLabel: {
        fontSize: isMiniature ? 10 : 12,
        color: '#495057'
      },
      axisLine: {
        lineStyle: {
          color: '#adb5bd'
        }
      },
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: maxValue || 1,
      calculable: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      inRange: {
        color: heatmapColors
      },
      textStyle: {
        color: '#495057'
      }
    },
    series: [{
      name: 'Heatmap',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: !isMiniature,
        fontSize: isMiniature ? 8 : 10,
        color: '#2c3e50'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      progressive: 1000,
      animation: true
    }],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };

  return (
    <div className={`chart-container ${isMiniature ? 'miniature' : ''}`}>
      {!isMiniature && title && <div className="chart-title">🔥 {title}</div>}
      <ReactECharts
        option={option}
        style={{ 
          height: isMiniature ? '180px' : '400px', 
          width: '100%' 
        }}
        opts={{ 
          renderer: 'canvas',
          useDirtyRect: true 
        }}
      />
    </div>
  );
}

export default HeatMap;