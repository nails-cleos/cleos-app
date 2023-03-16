import { ChartConfiguration, ChartData, ChartOptions, ChartType, TooltipItem } from 'chart.js';
import { IChart } from '../interfaces/dashboard';

export interface IChartUtil {
  labels: any[];
  dataSet: ChartConfiguration['data'];
  data?: ChartData;
  type: ChartType;
  // TODO color is not used
  colors: any[];
  options: ChartOptions;
}

export const createChart = (chart: IChart, isDark?: boolean): IChartUtil => {
  let dataSet: any[] = [];
  if (chart.dataSet && chart.dataSet.length) {
    chart.dataSet.forEach(value => {
      dataSet = [...dataSet, { data: value.data, label: value.label, type: value.type }];
    });
  }
  let data: any | undefined;
  if (chart.data) {
    data = chart.data;
  }
  let colors;
  switch (chart.colors) {
    case 'COLORS_ARRAY':
      colors = chartArrayColors();
      break;
    case 'COLORS':
    default:
      colors = chartColors();
  }
  let options;
  switch (chart.options) {
    case 'NO_LABEL':
      options = barChartNoLabelOptions();
      break;
    case 'BAR_CHART':
    case 'LINE_CHART':
      options = barChartDefaultOptions();
      break;
    case 'RADAR_CHART':
      options = radarChartDefaultOptions(isDark);
      break;
    case 'PERCENTAGE_CHART':
      options = pieChartPercentageOptions();
      break;
    case 'TIME_CHART':
      options = barChartTimeOptions();
      break;
    case 'CHART':
    default:
      options = defaultOptions();
  }

  const charData: ChartConfiguration['data'] = {
    datasets: dataSet
  }

  return {
    labels: chart.labels || [],
    type: chart.type || 'bar',
    dataSet: charData,
    data, colors, options
  };
};

const defaultOptions = (): ChartOptions => ({
  responsive: true
});

const radarChartDefaultOptions = (isDark?: boolean): ChartOptions<'radar'> => {
  const options = {
    responsive: true,
    scales: {
      pointLabels: {
        // @ts-ignore
        callback: value => formatLabel(value)
      },
      ticks: {
        suggestedMin: 0,
        precision: 0
      }
    }
  } as ChartOptions<'radar'>;
  if (isDark) {
    Object.assign({}, options.scales, { gridLines: { color: 'rgba(255, 255, 255, 0.1)' } });
    Object.assign({}, options.scales, { angleLines: { color: 'rgba(255, 255, 255, 0.1)' } });
    Object.assign({}, options.scales?.pointLabels, { color: 'white' });
    Object.assign({}, options.scales?.ticks, { backdropColor: '#393939', color: 'white' });
  }

  return options;
};

const barChartDefaultOptions = (): ChartOptions<'bar'> => ({
  responsive: true,
  scales: {
    y: {
      beginAtZero: true
    },
    x: {
      ticks: {
        callback: value => formatLabel(value)
      }
    }
  }
});

const barChartNoLabelOptions = (): ChartOptions<'bar'> => ({
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
});

const barChartTimeOptions = (): ChartOptions<'bar'> => ({
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (v: any) => formatSecsAsHourMin(v),
        stepSize: 1800
      }
    },
    x: {
      ticks: {
        callback: value => formatLabel(value)
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
});

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

const formatLabel = (value: string | number): string | number =>
  String(value).length > 10 ? `${ String(value).substring(0, 15) }...` : value;

const formatSecsAsHourMin = (d: any): string =>
  new Date(d * 1000).toISOString().substr(11, 5);

const barChatTimeLabel = (tooltipItem: any): string => tooltipItem.label + ': ' + formatSecsAsHourMin(tooltipItem.raw);

const chartArrayColors = (): any[] => ([{
  hoverBackgroundColor: ['rgba(254, 205, 190, 0.6)', 'rgba(152, 109, 142, 0.6)', 'rgba(95, 147, 154, 0.6)',
    'rgba(161, 202, 226, 0.6)', 'rgba(242, 213, 239, 0.6)', 'rgba(203, 239, 227, 0.6)', 'rgba(194, 213, 167, 0.6)',
    'rgba(176, 171, 202, 0.6)', 'rgba(226, 169, 190, 0.6)', 'rgba(163, 214, 212, 0.6)'],
  borderColor: ['#fff', '#fff', '#fff', '#fff'],
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
