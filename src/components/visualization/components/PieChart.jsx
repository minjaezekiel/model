import React from 'react';
import ReactECharts from 'echarts-for-react';
import './ChartStyles.css';
import * as echarts from 'echarts';

function PieChart({ chartData, title, xAxisColumn, yAxisColumn, isMiniature = false }) {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', 
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#ff9a9e', '#fad0c4'
  ];

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
      trigger: 'item',
      backgroundColor: 'rgba(44, 62, 80, 0.95)',
      borderColor: '#667eea',
      borderWidth: 2,
      textStyle: {
        color: '#fff'
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    toolbox: isMiniature ? undefined : {
      feature: {
        saveAsImage: { 
          title: 'Save as Image',
          iconStyle: {
            borderColor: '#667eea'
          }
        },
        dataView: { 
          title: 'Data View', 
          readOnly: true,
          iconStyle: {
            borderColor: '#667eea'
          }
        }
      }
    },
    legend: isMiniature ? {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        fontSize: 10,
        color: '#495057'
      }
    } : {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'middle',
      textStyle: {
        fontSize: 12,
        color: '#495057'
      }
    },
    series: [{
      name: title,
      type: 'pie',
      radius: isMiniature ? ['40%', '70%'] : ['50%', '80%'],
      center: isMiniature ? ['50%', '45%'] : ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      label: {
        show: !isMiniature,
        formatter: '{b}: {d}%',
        fontSize: isMiniature ? 10 : 12,
        color: '#495057'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: isMiniature ? 12 : 14,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: !isMiniature,
        length: isMiniature ? 10 : 20,
        length2: isMiniature ? 5 : 10
      },
      data: chartData.map((item, index) => ({
        ...item,
        itemStyle: {
          color: colors[index % colors.length]
        }
      })),
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return Math.random() * 200;
      }
    }],
    animation: true,
    animationDuration: 1000
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

export default PieChart;