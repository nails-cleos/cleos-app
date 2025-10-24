import {
  clean,
  dashFailure,
  dashSuccess,
  eventSuccess,
  exportYearSummary,
  getCards,
  getEvents,
  getMonthlySummary,
  getMyEvent,
  getQuarterSummary,
  getYearSummary,
  monthlySummarySuccess,
  quarterSummarySuccess,
  saveMonthlySummarySuccess,
  updateMonthlySummary,
  yearExportSuccess,
  yearSummarySuccess,
} from '../dashboard.actions';
import {
  IDashboard,
  IMonthlyExport,
  IMonthlyRoomSummary,
  IMonthlySummaryExpense,
  IMonthlySummarySale,
  IMonthSummary,
  IQuarterRoomSummary,
  IQuarterSummary,
  IRoomEvents,
  ISummaryRoom,
  ISummaryTotal,
  IYearRoomExport,
  IYearRoomSummary,
  MonthSummary,
  QuarterSummary,
} from '../../interfaces/dashboard';
import { getMonth } from '../../util/dates';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';

export interface State {
  response?: IResponseSuccess;
  data: Map<string, IDashboard>;
  dashboard?: IRoomEvents;
  monthlySummaryMap?: Map<ISummaryRoom,
    {
      summarySale: IMonthlySummarySale[];
      summaryCashSale: IMonthlySummarySale[];
      summaryExpenses: IMonthlySummaryExpense[]
    }>;
  yearSummaryMap?: Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }>;
  quarterSummaryMap?: Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }>;
  yearExport?: Map<ISummaryRoom, { monthlyExport: IMonthlyExport[]; }>;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

const initialState: State = {
  data: new Map<string, IDashboard>(),
  dashboard: undefined,
  monthlySummaryMap: undefined,
  yearSummaryMap: undefined,
  quarterSummaryMap: undefined,
  yearExport: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  response: undefined,
  isLoading: false,
};

const getMap = (a: Map<string, IDashboard>, b: IDashboard): Map<string, IDashboard> => {
  const res = new Map(a);

  Object.keys(b).forEach(key => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const data = b[key];
    const dashKey = data.roomName || data.professionalName;

    if (dashKey) {
      const values = res.get(dashKey) || {};
      res.set(dashKey, { ...values, ...data });
    }
  });

  return res;
};

const cleanEventMap = (data: Map<string, IDashboard>): Map<string, IDashboard> => {
  data.forEach((value, key) => {
    value.calendarSummary = undefined;
    data.set(key, value);
  });

  return data;
};

const cleanCardMap = (data: Map<string, IDashboard>): Map<string, IDashboard> => {
  data.forEach((value, key) => {
    value.chartSummaries = undefined;
    value.miniCardSummaries = undefined;
    value.thisMonthTotal = undefined;
    data.set(key, value);
  });

  return data;
};

const monthSummaryMap = (summaries: IMonthlyRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    summarySale: summary.saleSummary,
    summaryExpenses: summary.expenseSummary,
    summaryCashSale: summary.cashSaleSummary,
  });
  return map;
}, new Map<ISummaryRoom, {
  summarySale: IMonthlySummarySale[];
  summaryExpenses: IMonthlySummaryExpense[];
  summaryCashSale: IMonthlySummarySale[];
}>());

const yearExportMap = (summaries: IYearRoomExport[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    monthlyExport: summary.monthExport,
  });
  return map;
}, new Map<ISummaryRoom, {
  monthlyExport: IMonthlyExport[];
}>());

const emptySummaryTotal = (type: string): ISummaryTotal => ({ type, net: 0, btw: 0, gross: 0 } as ISummaryTotal);

const emptySummariesTotal = (): ISummaryTotal[] => [emptySummaryTotal('INCOME'), emptySummaryTotal('EXPENSE'),
  emptySummaryTotal('CASH')];

const emptyQuarterMonth = (month: number) => new MonthSummary(month, emptySummariesTotal());

const totalTypes = (quarterSummary: IMonthSummary) => ['INCOME', 'CASH', 'EXPENSE'].flatMap(type => {
  const matchingTotals = quarterSummary.total.filter(total => total.type === type);
  return matchingTotals.length ? matchingTotals : [emptySummaryTotal(type)];
});

const fullYear = (quarterSummaries: IQuarterSummary[]): IQuarterSummary[] => [1, 2, 3, 4].map(quarter => {
  const quarterSummary = quarterSummaries.find(year => year.quarter === quarter);
  if (quarterSummary) {
    const monthSummaries = [1, 2, 3].map(key => {
      const monthSummary = quarterSummary.monthSummaries.find(quarterS => quarterS.month === getMonth(quarter, key));
      if (monthSummary) {
        return new MonthSummary(monthSummary.month, totalTypes(monthSummary));
      }
      return emptyQuarterMonth(getMonth(quarter, key));
    });
    return new QuarterSummary(quarterSummary.quarter, monthSummaries);
  }
  const summaries = [1, 2, 3].map(key => emptyQuarterMonth(getMonth(quarter, key)));
  return new QuarterSummary(quarter, summaries);
});

const fullQuarter = (monthSummaries: IMonthSummary[], quarter: number): IMonthSummary[] => [1, 2, 3].map(key => {
  const monthSummary = monthSummaries.find(quarterS => quarterS.month === getMonth(quarter, key));
  if (monthSummary) {
    return new MonthSummary(monthSummary.month, totalTypes(monthSummary));
  }
  return emptyQuarterMonth(getMonth(quarter, key));
});

const yearSummaryMap = (summaries: IYearRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    quarterSummaries: fullYear(summary.quarterSummaries),
  });
  return map;
}, new Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }>());

const quarterSummaryMap = (summaries: IQuarterRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    monthSummaries: fullQuarter(summary.monthSummaries, summary.quarter),
  });
  return map;
}, new Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }>());

export const dashboardReducer = createReducer(
  initialState,
  on(getEvents, (state) => ({
    ...state,
    data: cleanEventMap(state.data),
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getMyEvent, (state) => ({
    ...state,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dashboard: { availability: {} },
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getCards, (state) => ({
    ...state,
    data: cleanCardMap(state.data),
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(dashSuccess, (state, { data }) => ({
    ...state,
    data: getMap(state.data, data),
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(eventSuccess, (state, { data }) => ({
    ...state,
    dashboard: data,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(dashFailure, (state, { error }) => ({
    ...state,
    errorMessage: error?.message,
    error: error,
    subErrors: error?.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(getMonthlySummary, (state) => ({
    ...state,
    monthlySummaryMap: undefined,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(monthlySummarySuccess, (state, { monthlySummary }) => ({
    ...state,
    monthlySummaryMap: monthSummaryMap(monthlySummary),
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(updateMonthlySummary, (state) => ({
    ...state,
    monthlySummaryMap: undefined,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(saveMonthlySummarySuccess, (state, action) => ({
    ...state,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: action,
  })),
  on(getYearSummary, (state) => ({
    ...state,
    yearSummaryMap: undefined,
    yearExport: undefined,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(yearSummarySuccess, (state, { yearSummary }) => ({
    ...state,
    yearSummaryMap: yearSummaryMap(yearSummary),
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(exportYearSummary, (state) => ({
    ...state,
    yearExport: undefined,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(yearExportSuccess, (state, { yearExport }) => ({
    ...state,
    yearExport: yearExportMap(yearExport),
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getQuarterSummary, (state) => ({
    ...state,
    quarterSummaryMap: undefined,
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(quarterSummarySuccess, (state, { quarterSummary }) => ({
    ...state,
    quarterSummaryMap: quarterSummaryMap(quarterSummary),
    errorMessage: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(clean, () => initialState),
);
