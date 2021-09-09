import { IPaymentReservation, States } from '../interfaces/reservation';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { IChartSummary } from '../interfaces/dashboard';

export interface IChartUtil {
  labels: Label[];
  dataSet: ChartDataSets[];
  data?: SingleDataSet;
  type: ChartType;
  colors: Color[];
  options: ChartOptions;
}

export const productChart = (result: IPaymentReservation[] | undefined): IChartSummary | undefined => {
  const completedList = result?.filter(r => r.reservation.state === States.completed);
  if (completedList && completedList.length) {
    const group = completedList.reduce((map, item) => {
      let total = map.get(item.reservation.product.name) || 0;
      map.set(item.reservation.product.name, ++total);

      return map;
    }, new Map<string, number>());

    return {
      labels: Array.from(group.keys()),
      data: Array.from(group.values()),
      type: 'pie',
      colors: 'COLORS_ARRAY',
      options: 'PERCENTAGE_CHART'
    } as IChartSummary;
  }
  return undefined;
};

export const paymentChart = (completedList: IPaymentReservation[] | undefined,
                             translate: TranslateService): IChartSummary | undefined => {
  if (completedList && completedList.length) {
    let total = 0;
    const paymentMap = new Map<string, number>();
    paymentMap.set(translate.instant('COMMON.PAYMENT.ML'), 0);
    paymentMap.set(translate.instant('COMMON.PAYMENT.CASH'), 0);
    const group = completedList.reduce((map, item) => {
      const payments = item.payments.filter(p => p.status === 'approved');
      payments.forEach(p => {
        total += p.amount;
        const type = translate.instant(`COMMON.PAYMENT.${p.type}`);
        map.set(type, (map.get(type) || 0) + p.amount);
      });

      return map;
    }, paymentMap);

    return {
      labels: Array.from(group.keys()),
      data: Array.from(group.values()),
      type: 'pie',
      colors: 'COLORS_ARRAY',
      options: 'PERCENTAGE_CHART'
    } as IChartSummary;
  }
  return undefined;
};

export const createChart = (chart: IChartSummary, isDark?: boolean): IChartUtil => {
  let dataSet: ChartDataSets[] = [];
  if (chart.dataSet && chart.dataSet.length) {
    chart.dataSet.forEach(value => {
      dataSet = [...dataSet, {data: value.data, label: value.label, type: value.type}];
    });
  }
  let data: SingleDataSet | undefined;
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

  return {
    labels: chart.labels || [],
    type: chart.type || 'bar',
    dataSet, data, colors, options
  };
};

const defaultOptions = (): ChartOptions => ({
  responsive: true
});

const radarChartDefaultOptions = (isDark?: boolean): ChartOptions => {
  const options = {
    responsive: true,
    scale: {
      pointLabels: {
        callback: value => formatLabel(value)
      },
      ticks: {
        suggestedMin: 0,
        precision: 0
      }
    }
  } as ChartOptions;
  if (isDark) {
    Object.assign(options.scale, {gridLines: {color: 'rgba(255, 255, 255, 0.1)'}});
    Object.assign(options.scale, {angleLines: {color: 'rgba(255, 255, 255, 0.1)'}});
    Object.assign(options.scale?.pointLabels, {fontColor: 'white'});
    Object.assign(options.scale?.ticks, {backdropColor: '#393939', fontColor: 'white'});
  }

  return options;
};

const barChartDefaultOptions = (): ChartOptions => ({
  responsive: true,
  scales: {
    yAxes: [{
      ticks: {
        // @ts-ignore
        precision: 0,
        beginAtZero: true
      }
    }],
    xAxes: [{
      ticks: {
        callback: value => formatLabel(value)
      }
    }]
  }
});

const barChartTimeOptions = (): ChartOptions => ({
  responsive: true,
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
        callback: (v: any) => formatSecsAsHourMin(v),
        stepSize: 1800
      }
    }],
    xAxes: [{
      ticks: {
        callback: value => formatLabel(value)
      }
    }]
  },
  tooltips: {
    callbacks: {
      label: (tooltipItem: any, data: any) => barChatTimeLabel(tooltipItem, data)
    }
  }
});

const pieChartPercentageOptions = (): ChartOptions => ({
  responsive: true,
  tooltips: {
    callbacks: {
      label: (tooltipItem: any, data: any) => pieChatPercentageLabel(tooltipItem, data)
    }
  }
});

const pieChatPercentageLabel = (tooltipItem: any, data: any): string => {
  const values = data.datasets[tooltipItem.datasetIndex].data;
  const total = values.reduce((a: number, b: number) => a + b);
  return `${data.labels[tooltipItem.index]}: ${(values[tooltipItem.index] * 100 / total).toFixed(2)}%`;
};

const formatLabel = (value: string | number): string | number =>
  String(value).length > 10 ? `${String(value).substring(0, 15)}...` : value;

const formatSecsAsHourMin = (d: any): string =>
  new Date(d * 1000).toISOString().substr(11, 5);

const barChatTimeLabel = (tooltipItem: any, data: any): string =>
  data.datasets[tooltipItem.datasetIndex].label + ': ' + formatSecsAsHourMin(tooltipItem.yLabel);

const chartArrayColors = (): Color[] => ([{
  backgroundColor: ['rgba(254, 205, 190, 0.6)', 'rgba(152, 109, 142, 0.6)', 'rgba(95, 147, 154, 0.6)', 'rgba(161, 202, 226, 0.6)'],
  borderColor: ['#fff', '#fff', '#fff', '#fff'],
  hoverBackgroundColor: ['rgba(254, 205, 190, 0.8)', 'rgba(152, 109, 142, 0.8)', 'rgba(95, 147, 154, 0.8)', 'rgba(161, 202, 226, 0.8)'],
  hoverBorderColor: ['rgba(254, 205, 190, 1)', 'rgba(152, 109, 142, 1)', 'rgba(95, 147, 154, 1)', 'rgba(161, 202, 226, 1)']
}]);

const chartColors = (): Color[] => ([{
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
