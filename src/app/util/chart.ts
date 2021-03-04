import { IReservationAll } from '../interfaces/reservation';
import { Label, SingleDataSet } from 'ng2-charts';
import { ChartDataSets } from 'chart.js';

interface IChartUtil {
  chartLabels: Label[];
  chartDataSet: ChartDataSets[];
  chartData: SingleDataSet;
}

export function CustomerReservation(result: IReservationAll[] | undefined, label: string): IChartUtil | null {
  const now = new Date();
  const completedList = completeWithDateFilter(result, now, 12);
  return barChart(completedList, label, 'customer', 'username');
}

export function QuantityProduct(result: IReservationAll[] | undefined, label: string): IChartUtil | null {
  const completedList = result?.filter(r => r.state === 'COMPLETED');
  return barChart(completedList, label, 'product', 'name');
}

export function AnnualReservation(result: IReservationAll[] | undefined, locale: string, label: string): IChartUtil | null {
  const now = new Date();
  const completedList = completeWithDateFilter(result, now, 12);
  if (completedList) {
    const group = completedList.reduce((map, item) => {
      const formattedDate = formatMonthYear(new Date(item.start), locale);
      const key = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      const price = map.get(key) || 0;

      map.set(key, price + item.product.price);

      return map;
    }, new Map<string, number>());

    let data: number[] = [];
    let labels: string[] = [];

    for (let i = 12; i >= 0; i--) {
      const date = new Date(new Date().setMonth(now.getMonth() - i, 1));
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
}

export function LastMonthReservation(result: IReservationAll[] | undefined, locale: string, label: string): IChartUtil | null {
  const now = new Date();
  const completedList = completeWithDateFilter(result, now, 1);
  if (completedList) {
    let data: number[] = [];
    let labels: string[] = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(new Date().setDate(now.getDate() - i));
      const formattedDate = formatDate(date, locale);
      const total: number = completedList.filter(r => formatDate(new Date(r.start), locale) === formattedDate).length;

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
}

export function ProductReservation(result: IReservationAll[] | undefined): IChartUtil | null {
  const completedList = result?.filter(r => r.state === 'COMPLETED');
  if (completedList) {
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
}

export function MonthlyReservation(result: IReservationAll[] | undefined, locale: string): IChartUtil | null {
  const now = new Date();
  const completedList = completeWithDateFilter(result, now, 12);
  if (completedList) {
    const group = completedList.reduce((map, item) => {
      const formattedDate = new Date(item.start).toLocaleDateString(locale, {
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
}

function barChart(completedList: IReservationAll[] | undefined, label: string, key: string, value: string): IChartUtil | null {
  if (completedList) {
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
}

function formatMonthYear(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    month: 'short', year: 'numeric'
  }).replace(/ /g, '-');
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: 'numeric', month: 'short', year: 'numeric'
  }).replace(/ /g, '-');
}

function completeWithDateFilter(result: IReservationAll[] | undefined, now: Date, minusMonth: number): IReservationAll[] | undefined {
  const filterDate = new Date(new Date().setMonth(now.getMonth() - minusMonth, 0));
  return result?.filter(r => r.state === 'COMPLETED' && new Date(r.start) > filterDate);
}
