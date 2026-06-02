import {
  cleanDashboard,
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
  setDashNavigationParams,
  setMonthlyNavigationParams,
  setQuarterNavigationParams,
  setYearNavigationParams,
  updateMonthlySummary,
  yearExportSuccess,
  yearSummarySuccess,
} from '../actions/dashboard.actions';
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

export const DASHBOARD_FEATURE_KEY = 'dashboard';

export interface DashboardState {
  response?: IResponseSuccess;
  data: Record<string, IDashboard>;
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
  monthlyNavigationParams?: { step?: number, date: Date | string };
  quarterNavigationParams?: { year?: number, quarter?: number };
  yearNavigationParams?: { year?: number };
  dashNavigationParams?: { date?: Date, activeDayIsOpen: boolean };
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

const initialState: DashboardState = {
  response: undefined,
  data: {},
  dashboard: undefined,
  monthlySummaryMap: undefined,
  yearSummaryMap: undefined,
  quarterSummaryMap: undefined,
  yearExport: undefined,
  monthlyNavigationParams: undefined,
  quarterNavigationParams: undefined,
  yearNavigationParams: undefined,
  dashNavigationParams: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

const mergeDashboard = (
  record: Record<string, IDashboard>,
  dashboards: IDashboard[],
): Record<string, IDashboard> => {

  const result = { ...record };

  dashboards.forEach(data => {
    const dashKey = data.roomName || data.professionalName;
    if (!dashKey) {
      return;
    }

    // Filter out null/undefined values to avoid overwriting existing data
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key as keyof IDashboard] = value;
      }
      return acc;
    }, {} as IDashboard);

    result[dashKey] = {
      ...(result[dashKey] ?? {}),
      ...filteredData,
    };
  });

  return result;
};


const cleanEventMap = (
  data: Record<string, IDashboard> = {},
): Record<string, IDashboard> => {
  const result: Record<string, IDashboard> = { ...data };

  Object.keys(result).forEach(key => {
    result[key] = {
      ...result[key],
      calendarSummary: undefined,
    };
  });

  return result;
};

const cleanCardMap = (
  data: Record<string, IDashboard> = {},
): Record<string, IDashboard> => {
  const result: Record<string, IDashboard> = { ...data };

  Object.keys(result).forEach(key => {
    result[key] = {
      ...result[key],
      chartSummaries: undefined,
      miniCardSummaries: undefined,
      thisMonthTotal: undefined,
    };
  });

  return result;
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
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getMyEvent, (state) => ({
    ...state,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dashboard: { availability: {} },
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getCards, (state) => ({
    ...state,
    data: cleanCardMap(state.data),
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(dashSuccess, (state, { data }) => ({
    ...state,
    data: mergeDashboard(state.data, data),
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(eventSuccess, (state, { data }) => ({
    ...state,
    dashboard: data,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(dashFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(getMonthlySummary, (state) => ({
    ...state,
    monthlySummaryMap: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(monthlySummarySuccess, (state, { monthlySummary }) => ({
    ...state,
    monthlySummaryMap: monthSummaryMap(monthlySummary),
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(updateMonthlySummary, (state) => ({
    ...state,
    monthlySummaryMap: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(saveMonthlySummarySuccess, (state, action) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
    response: action,
    isLoading: false,
  })),
  on(setMonthlyNavigationParams, (state, { step, date }) => ({
    ...state,
    monthlyNavigationParams: { step, date },
  })),
  on(setQuarterNavigationParams, (state, { year, quarter }) => ({
    ...state,
    quarterNavigationParams: { year, quarter },
  })),
  on(setYearNavigationParams, (state, { year }) => ({
    ...state,
    yearNavigationParams: { year },
  })),
  on(setDashNavigationParams, (state, { date, activeDayIsOpen }) => ({
    ...state,
    dashNavigationParams: { date, activeDayIsOpen },
  })),
  on(getYearSummary, (state) => ({
    ...state,
    yearSummaryMap: undefined,
    yearExport: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(yearSummarySuccess, (state, { yearSummary }) => ({
    ...state,
    yearSummaryMap: yearSummaryMap(yearSummary),
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(exportYearSummary, (state) => ({
    ...state,
    yearExport: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(yearExportSuccess, (state, { yearExport }) => ({
    ...state,
    yearExport: yearExportMap(yearExport),
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(getQuarterSummary, (state) => ({
    ...state,
    quarterSummaryMap: undefined,
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: true,
  })),
  on(quarterSummarySuccess, (state, { quarterSummary }) => ({
    ...state,
    quarterSummaryMap: quarterSummaryMap(quarterSummary),
    error: undefined,
    subErrors: undefined,
    response: undefined,
    isLoading: false,
  })),
  on(cleanDashboard, () => initialState),
);
