import React from 'react';
import ReactECharts from 'echarts-for-react';
import './ChartStyles.css';
import * as echarts from 'echarts';

function LineChart({ chartData, title, xAxisColumn, yAxisColumn, isMiniature = false }) {
  const option = {
    title: isMiniature ? undefined : {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(44, 62, 80, 0.95)',
      borderColor: '#91cc75',
      borderWidth: 2,
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        return `<strong>${params[0].name}</strong><br/>${yAxisColumn}: ${params[0].value}`;
      }
    },
    toolbox: isMiniature ? undefined : {
      feature: {
        saveAsImage: { 
          title: 'Save as Image',
          iconStyle: {
            borderColor: '#91cc75'
          }
        },
        dataView: { 
          title: 'Data View', 
          readOnly: true,
          iconStyle: {
            borderColor: '#91cc75'
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
      data: chartData.map(item => item.name),
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
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: isMiniature ? 10 : 12,
        color: '#495057'
      },
      axisLine: {
        lineStyle: {
          color: '#adb5bd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f8f9fa',
          type: 'dashed'
        }
      }
    },
    series: [{
      data: chartData.map(item => item.value),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: isMiniature ? 4 : 8,
      lineStyle: {
        width: isMiniature ? 2 : 4,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#43e97b' },
          { offset: 1, color: '#38f9d7' }
        ]),
        shadowColor: 'rgba(67, 233, 123, 0.3)',
        shadowBlur: 8,
        shadowOffsetY: 4
      },
      itemStyle: {
        color: '#43e97b',
        borderColor: '#fff',
        borderWidth: 2,
        shadowColor: 'rgba(67, 233, 123, 0.5)',
        shadowBlur: 4
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(67, 233, 123, 0.3)' },
          { offset: 1, color: 'rgba(56, 249, 215, 0.1)' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: '#fff',
          borderColor: '#43e97b',
          borderWidth: 3,
          shadowColor: 'rgba(67, 233, 123, 0.8)',
          shadowBlur: 8
        }
      }
    }],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };

  return (
    <div className={`chart-container ${isMiniature ? 'miniature' : ''}`}>
      {!isMiniature && title && <div className="chart-title">{title}</div>}
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

export default LineChart;