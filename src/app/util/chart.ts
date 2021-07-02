import { IReservationAll, ITracking } from '../interfaces/reservation';
import { Label, SingleDataSet } from 'ng2-charts';
import { ChartDataSets } from 'chart.js';
import { convertDuration, formatDate, getNow, getSecondsBetweenTimes, newDate, plusDay, plusMonthDate } from './dates';
import { totalPrice } from './helper';

interface IChartUtil {
  chartLabels: Label[];
  chartDataSet: ChartDataSets[];
  chartData: SingleDataSet;
}

export const customerReservationChart = (result: IReservationAll[] | undefined, label: string): IChartUtil | null => {
  const now = getNow();
  const completedList = completeWithDateFilter(result, now, 12);
  return barChart(completedList, label, 'customer', 'username');
};

export const quantityProductChart = (result: IReservationAll[] | undefined, label: string): IChartUtil | null => {
  const completedList = result?.filter(r => r.state === 'COMPLETED');
  return barChart(completedList, label, 'product', 'name');
};

export const annualReservationChart = (result: IReservationAll[] | undefined, locale: string, label: string): IChartUtil | null => {
  const now = getNow();
  const completedList = completeWithDateFilter(result, now, 12);
  if (completedList && completedList.length) {
    const group = completedList.reduce((map, item) => {
      const formattedDate = formatMonthYear(newDate(item.start), locale);
      const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      const price = map.get(key) || 0;

      map.set(key, price + totalPrice(item.product));

      return map;
    }, new Map<string, number>());

    let data: number[] = [];
    let labels: string[] = [];

    for (let i = 12; i >= 0; i--) {
      const date = plusMonthDate(getNow(), -i, 1);
      const formattedDate = formatMonthYear(date, locale);
      const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      labels = [...labels, key];

      const count = group.get(key) || 0;
      data = [...data, count];
    }
    return {
      chartDataSet: [{data, label}],
      chartLabels: labels
    } as IChartUtil;
  }
  return null;
};

export const lastMonthReservationChart = (result: IReservationAll[] | undefined, locale: string, label: string): IChartUtil | null => {
  const now = getNow();
  const completedList = completeWithDateFilter(result, now, 1);
  if (completedList && completedList.length) {
    let data: number[] = [];
    let labels: string[] = [];

    for (let i = 30; i >= 0; i--) {
      const date = plusDay(getNow(), -i);
      const formattedDate = formatDate(date, locale);
      const total: number = completedList.filter(r => formatDate(newDate(r.start), locale) === formattedDate).length;

      const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      labels = [...labels, key];

      data = [...data, total];
    }

    return {
      chartDataSet: [{data, label}],
      chartLabels: labels
    } as IChartUtil;
  }
  return null;
};

export const productReservationChart = (result: IReservationAll[] | undefined): IChartUtil | null => {
  const completedList = result?.filter(r => r.state === 'COMPLETED');
  if (completedList && completedList.length) {
    const distRoom: Array<any> = [...new Set(completedList.map(x => x.room.name))];

    const group = completedList.reduce((map, item) => {
      const productMap = map.get(item.product.name) || new Map();
      let total = productMap.get(item.room.name) || 0;
      productMap.set(item.room.name, ++total);

      map.set(item.product.name, productMap);

      return map;
    }, new Map<string, Map<string, number>>());

    const data = distRoom.reduce((r, i) => {
      const o = {label: i, data: []};

      r = [...r, o];

      return r;
    }, []);

    group.forEach(value => {
      data.forEach((v: any, k: any) => {
        // @ts-ignore
        const a = value.get(data[k].label) || 0;
        // @ts-ignore
        data[k].data = [...data[k].data, a];
      });
    });

    return {
      chartDataSet: data,
      chartLabels: Array.from(group.keys())
    } as IChartUtil;
  }
  return null;
};

export const monthlyReservationChart = (result: IReservationAll[] | undefined, locale: string): IChartUtil | null => {
  const now = getNow();
  const completedList = completeWithDateFilter(result, now, 12);
  if (completedList && completedList.length) {
    const group = completedList.reduce((map, item) => {
      const formattedDate = newDate(item.start).toLocaleDateString(locale, {
        month: 'short', year: 'numeric'
      }).replace(/ /g, '-');

      const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      let total = map.get(key) || 0;
      map.set(key, ++total);

      return map;
    }, new Map<string, number>());

    return {
      chartData: Array.from(group.values()),
      chartLabels: Array.from(group.keys())
    } as IChartUtil;
  }
  return null;
};

export const trackingAverageChart = (result: ITracking[] | undefined, labels: any): IChartUtil | null => {
  const completedList = result?.filter(r => r.reservation.state === 'COMPLETED');
  if (completedList && completedList.length) {
    const group = completedList.reduce((map, item) => {
      if (item.startedTime && item.completedTime) {
        let times = map.get(item.reservation.product.name) || [];
        const time = getSecondsBetweenTimes(newDate(item.startedTime), newDate(item.completedTime));
        times = [...times, time];
        map.set(item.reservation.product.name, times);
      }

      return map;
    }, new Map<string, number[]>());

    let minV: number[] = [];
    let avgV: number[] = [];
    let maxV: number[] = [];

    group.forEach((values: number[]) => {
      const {max, min, avg} = maxMinAvg(values);
      minV = [...minV, min];
      maxV = [...maxV, max];
      avgV = [...avgV, avg];
    });

    return {
      chartDataSet: [
        {data: minV, label: labels.min},
        {data: avgV, label: labels.avg, type: 'line'},
        {data: maxV, label: labels.max}
      ],
      chartLabels: Array.from(group.keys())
    } as IChartUtil;
  }
  return null;
};

export const trackingCompareChart = (result: ITracking[] | undefined, labels: any): IChartUtil | null => {
  const completedList = result?.filter(r => r.reservation.state === 'COMPLETED');
  if (completedList && completedList.length) {
    const group = completedList.reduce((map, item) => {
      if (item.startedTime && item.completedTime) {
        const duration = convertDuration(item.reservation.product.duration);
        const tuple = JSON.stringify({
          name: item.reservation.product.name,
          time: (duration.hour * 60 + duration.minute) * 60
        });

        let tracking = map.get(tuple) || [];
        tracking = [...tracking, getSecondsBetweenTimes(newDate(item.startedTime), newDate(item.completedTime))];
        map.set(tuple, tracking);
      }

      return map;
    }, new Map<string, number[]>());

    let chartLabels: string[] = [];
    let avgV: number[] = [];
    let estimate: number[] = [];
    group.forEach((values: number[], key: string) => {
      const {avg} = maxMinAvg(values);
      avgV = [...avgV, avg];
      const tuple = JSON.parse(key);
      chartLabels = [...chartLabels, tuple.name];
      estimate = [...estimate, tuple.time];
    });

    return {
      chartDataSet: [
        {data: avgV, label: labels.avg},
        {data: estimate, label: labels.estimate}
      ],
      chartLabels
    } as IChartUtil;
  }
  return null;
};

const barChart = (completedList: IReservationAll[] | undefined, label: string, key: string, value: string): IChartUtil | null => {
  if (completedList && completedList.length) {
    const group = completedList.reduce((map, item) => {
      // @ts-ignore
      let total = map.get(item[key][value]) || 0;
      // @ts-ignore
      map.set(item[key][value], ++total);

      return map;
    }, new Map<string, number>());

    return {
      chartDataSet: [{data: Array.from(group.values()), label}],
      chartLabels: Array.from(group.keys())
    } as IChartUtil;
  }
  return null;
};

const formatMonthYear = (date: Date, locale: string): string => date.toLocaleDateString(locale, {
  month: 'short', year: 'numeric'
}).replace(/ /g, '-');

const completeWithDateFilter = (result: IReservationAll[] | undefined, now: Date, minusMonth: number): IReservationAll[] | undefined => {
  const filterDate = plusMonthDate(getNow(), -minusMonth, 0);
  return result?.filter(r => r.state === 'COMPLETED' && newDate(r.start) > filterDate);
};

const maxMinAvg = (arr: number[]): any => {
  let max = arr[0];
  let min = arr[0];
  let sum = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
    if (arr[i] < min) {
      min = arr[i];
    }
    sum = sum + arr[i];
  }

  return {max, min, avg: sum / arr.length};
};

export const barChartTimeOptions = (): any => (
  {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          callback: (v: any) => formatSecsAsHourMin(v),
          stepSize: 1800
        }
      }]
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem: any, data: any) => barChatTimeLabel(tooltipItem, data)
      }
    }
  });

const formatSecsAsHourMin = (d: any): string =>
  new Date(d * 1000).toISOString().substr(11, 5);

const barChatTimeLabel = (tooltipItem: any, data: any): string =>
  data.datasets[tooltipItem.datasetIndex].label + ': ' + formatSecsAsHourMin(tooltipItem.yLabel);

export const barChartDefaultOptions = (): any => (
  {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
);
