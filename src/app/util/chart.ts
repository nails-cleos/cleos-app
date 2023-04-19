import { ChartConfiguration, ChartOptions, ChartType, TooltipItem } from 'chart.js';
import { IChart } from '../interfaces/dashboard';

export interface IChartUtil {
  labels: any[];
  charData: ChartConfiguration['data'];
  type: ChartType;
  options: ChartOptions;
}

export const createChart = (chart: IChart, isDark?: boolean): IChartUtil => {
  let colors: any[];
  switch (chart.colors) {
    case 'COLORS_ARRAY':
      colors = chartArrayColors();
      break;
    case 'COLORS':
    default:
      colors = chartColors();
  }
  let options: ChartOptions<any>;
  switch (chart.options) {
    case 'NO_LABEL':
      options = barChartNoLabelOptions(isDark);
      break;
    case 'BAR_CHART':
    case 'LINE_CHART':
      options = barChartDefaultOptions(isDark);
      break;
    case 'RADAR_CHART':
      options = radarChartDefaultOptions(isDark);
      break;
    case 'PERCENTAGE_CHART':
      options = pieChartPercentageOptions();
      break;
    case 'TIME_CHART':
      options = barChartTimeOptions(isDark);
      break;
    case 'CHART':
    default:
      options = defaultOptions();
  }

  let dataSet: any[] = [];
  if (chart.dataSet && chart.dataSet.length) {
    chart.dataSet.forEach((value, i) => {
      const color = colors[i % 10]
      dataSet = [...dataSet, {
        data: value.data,
        label: value.label,
        type: value.type,
        backgroundColor: color.backgroundColor,
        hoverBackgroundColor: color.hoverBackgroundColor,
        borderColor: color.borderColor,
        hoverBorderColor: color.hoverBorderColor,
        pointBackgroundColor: color.pointBackgroundColor,
        pointBorderColor: color.pointBorderColor,
        pointHoverBackgroundColor: color.pointHoverBackgroundColor,
        pointHoverBorderColor: color.pointHoverBorderColor
      }];
    });
  }

  const charData: ChartConfiguration['data'] = {
    labels: chart.labels || [],
    datasets: dataSet
  }

  return {
    labels: chart.labels || [],
    type: chart.type || 'bar',
    charData,
    options
  };
};

const defaultOptions = (): ChartOptions => ({
  responsive: true
});

const radarChartDefaultOptions = (isDark?: boolean): ChartOptions<'radar'> => {
  let options: ChartOptions<'radar'>
  if (isDark) {
    options = {
      responsive: true,
      scales: {
        r: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          angleLines: {
            display: true,
            color: 'white'
          },
          suggestedMin: 0,
          pointLabels: {
            color: 'white'
          },
          ticks: {
            // stepSize: 1,
            display: true,
            color: 'white',
            backdropColor: '#424242'
          }
        }
      }
    }
  } else {
    options = {
      responsive: true,
      scales: {
        r: {
          angleLines: {
            display: true,
            color: 'black'
          },
          suggestedMin: 0,
          ticks: {
            stepSize: 1,
            display: true
          }
        }
      }
    }
  }
  return options;
};

const barChartDefaultOptions = (isDark?: boolean): ChartOptions<'bar'> => {
  let options: ChartOptions<'bar'>;
  if (isDark) {
    options = {
      responsive: true,
      scales: {
        y: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          beginAtZero: true
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        legend: {
          display: true,
        }
      }
    }
  } else {
    options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
        }
      }
    }
  }
  return options;
};

const barChartNoLabelOptions = (isDark?: boolean): ChartOptions<'bar'> => {
  let options: ChartOptions<'bar'>;
  if (isDark) {
    options = {
      responsive: true,
      scales: {
        y: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          beginAtZero: true
        },
        x: {
          ticks: {
            color: 'white',
            callback: () => ''
          },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      }
    }
  } else {
    options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        },
        x: {
          ticks: {
            callback: () => ''
          }
        }
      }
    }
  }

  return options;
};

const barChartTimeOptions = (isDark?: boolean): ChartOptions<'bar'> => {
  let options: ChartOptions<'bar'>
  if (isDark) {
    options = {
      responsive: true,
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.1)' },
          beginAtZero: true,
          ticks: {
            callback: (v: any) => formatSecsAsHourMin(v),
            stepSize: 1800,
            color: 'white'
          }
        },
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => barChatTimeLabel(tooltipItem)
          }
        }
      }
    }
  } else {
    options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v: any) => formatSecsAsHourMin(v),
            stepSize: 1800
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => barChatTimeLabel(tooltipItem)
          }
        }
      }
    }
  }

  return options;
};

const pieChartPercentageOptions = (): ChartOptions<'pie'> => ({
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (tooltipItem) => pieChatPercentageLabel(tooltipItem)
      }
    }
  }
});

const pieChatPercentageLabel = (tooltipItem: TooltipItem<'pie'>): string => {
  const total = tooltipItem.dataset.data.reduce((a, b) => a + b);
  return `${ tooltipItem.label }: ${ (Number(tooltipItem.raw) * 100 / total).toFixed(2) }%`;
};

const formatSecsAsHourMin = (d: any): string =>
  new Date(d * 1000).toISOString().substr(11, 5);

const barChatTimeLabel = (tooltipItem: any): string => tooltipItem.label + ': ' + formatSecsAsHourMin(tooltipItem.raw);

const chartArrayColors = (): any[] => ([{
  hoverBackgroundColor: ['rgba(254, 205, 190, 0.6)', 'rgba(152, 109, 142, 0.6)', 'rgba(95, 147, 154, 0.6)',
    'rgba(161, 202, 226, 0.6)', 'rgba(242, 213, 239, 0.6)', 'rgba(203, 239, 227, 0.6)', 'rgba(194, 213, 167, 0.6)',
    'rgba(176, 171, 202, 0.6)', 'rgba(226, 169, 190, 0.6)', 'rgba(163, 214, 212, 0.6)'],
  borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
  backgroundColor: ['rgba(254, 205, 190, 0.8)', 'rgba(152, 109, 142, 0.8)', 'rgba(95, 147, 154, 0.8)',
    'rgba(161, 202, 226, 0.8)', 'rgba(242, 213, 239, 0.8)', 'rgba(203, 239, 227, 0.8)', 'rgba(194, 213, 167, 0.8)',
    'rgba(176, 171, 202, 0.8)', 'rgba(226, 169, 190, 0.8)', 'rgba(163, 214, 212, 0.8)'],
  hoverBorderColor: ['rgb(254, 205, 190)', 'rgb(152, 109, 142)', 'rgb(95, 147, 154)',
    'rgb(161, 202, 226)', 'rgb(242, 213, 239)', 'rgb(203, 239, 227)', 'rgb(194, 213, 167)',
    'rgb(176, 171, 202)', 'rgb(226, 169, 190)', 'rgb(163, 214, 212)']
}]);

const chartColors = (): any[] => ([{
  backgroundColor: 'rgba(254, 205, 190, 0.6)',
  borderColor: 'rgba(254, 205, 190, 1)',
  pointBackgroundColor: 'rgba(254, 205, 190, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(254, 205, 190, 0.8)',
  hoverBackgroundColor: 'rgba(254, 205, 190, 0.8)',
  hoverBorderColor: 'rgba(254, 205, 190, 1)'
}, {
  backgroundColor: 'rgba(152, 109, 142, 0.6)',
  borderColor: 'rgba(152, 109, 142, 1)',
  pointBackgroundColor: 'rgba(152, 109, 142, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(152, 109, 142, 0.8)',
  hoverBackgroundColor: 'rgba(152, 109, 142, 0.8)',
  hoverBorderColor: 'rgba(152, 109, 142, 1)'
}, {
  backgroundColor: 'rgba(95, 147, 154, 0.6)',
  borderColor: 'rgba(95, 147, 154, 1)',
  pointBackgroundColor: 'rgba(95, 147, 154, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(95, 147, 154, 0.8)',
  hoverBackgroundColor: 'rgba(95, 147, 154, 0.8)',
  hoverBorderColor: 'rgba(95, 147, 154, 1)'
}, {
  backgroundColor: 'rgba(161, 202, 226, 0.6)',
  borderColor: 'rgba(161, 202, 226, 1)',
  pointBackgroundColor: 'rgba(161, 202, 226, 1)',
  pointBorderColor: '#fff',
  pointHoverBackgroundColor: '#fff',
  pointHoverBorderColor: 'rgba(161, 202, 226, 0.8)',
  hoverBackgroundColor: 'rgba(161, 202, 226, 0.8)',
  hoverBorderColor: 'rgba(161, 202, 226, 1)'
}]);
