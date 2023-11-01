import { All, DashboardActionTypes } from '../dashboard.actions';
import {
  IDashboard,
  IMonthlyRoomSummary,
  IMonthlySummaryExpense,
  IMonthlySummarySale,
  IMonthSummary,
  IQuarterRoomSummary,
  IQuarterSummary,
  IRoomEvents,
  ISummaryRoom,
  ISummaryTotal,
  IYearRoomSummary,
  MonthSummary,
  QuarterSummary
} from '../../interfaces/dashboard';

export interface State {
  data: Map<string, IDashboard>;
  dashboard: IRoomEvents | null;
  monthlySummaryMap: Map<ISummaryRoom,
    { summarySale: IMonthlySummarySale[]; summaryCashSale: IMonthlySummarySale[]; summaryExpenses: IMonthlySummaryExpense[] }> | null;
  yearSummaryMap: Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }> | null;
  quarterSummaryMap: Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
}

const initialState: State = {
  data: new Map<string, IDashboard>(),
  dashboard: null,
  monthlySummaryMap: null,
  yearSummaryMap: null,
  quarterSummaryMap: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  message: null,
  isLoading: false
};

const merge = (a: IDashboard, b: IDashboard) => {
  const res = {};
  Object.keys({ ...a, ...b }).map(key => {
    // @ts-ignore
    res[key] = b[key] || a[key];
  });
  return res;
};

const getMap = (a: Map<string, IDashboard>, b: IDashboard) => {
  const res = a;
  Object.keys({ ...a, ...b }).map(key => {
    // @ts-ignore
    const data = b[key];
    const dashKey = data.roomName || data.professionalName;
    const values = a.get(dashKey);
    res.set(dashKey, merge(data, values || {}));
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
    data.set(key, value);
  });

  return data;
};

const monthSummaryMap = (summaries: IMonthlyRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone
  }, {
    summarySale: summary.saleSummary,
    summaryExpenses: summary.expenseSummary,
    summaryCashSale: summary.cashSaleSummary
  });
  return map;
}, new Map<ISummaryRoom, {
  summarySale: IMonthlySummarySale[];
  summaryExpenses: IMonthlySummaryExpense[];
  summaryCashSale: IMonthlySummarySale[];
}>());

const emptySummaryTotal = (type: string): ISummaryTotal => ({ type, net: 0, btw: 0, gross: 0 } as ISummaryTotal);

const emptySummariesTotal = (): ISummaryTotal[] => [emptySummaryTotal('INCOME'), emptySummaryTotal('EXPENSE'),
  emptySummaryTotal('CASH')];

const getMonth = (quarter: number, key: number): number => ((quarter - 1) * 3) + key;

const emptyQuarterMonth = (month: number) => new MonthSummary(month, emptySummariesTotal());

const totalTypes = (quarterSummary: IMonthSummary) => ['INCOME', 'EXPENSE', 'CASH'].map(type => {
  const totalType = quarterSummary.total.find(total => total.type === type);
  if (totalType) {
    return totalType;
  }
  return emptySummaryTotal(type);
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
    timeZone: summary.timeZone
  }, {
    quarterSummaries: fullYear(summary.quarterSummaries)
  });
  return map;
}, new Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }>());

const quarterSummaryMap = (summaries: IQuarterRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone
  }, {
    monthSummaries: fullQuarter(summary.monthSummaries, summary.quarter)
  });
  return map;
}, new Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }>());

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case DashboardActionTypes.dashEvents: {
      return {
        ...state,
        data: cleanEventMap(state.data),
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.dashboardEvents: {
      return {
        ...state,
        // @ts-ignore
        dashboard: { availability: {} },
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.dashCards: {
      return {
        ...state,
        data: cleanCardMap(state.data),
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.dashSuccess: {
      return {
        ...state,
        data: getMap(state.data, action.payload),
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case DashboardActionTypes.eventSuccess: {
      return {
        ...state,
        dashboard: action.payload,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case DashboardActionTypes.dashFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case DashboardActionTypes.monthlySummary: {
      return {
        ...state,
        monthlySummaryMap: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.monthlySummarySuccess: {
      return {
        ...state,
        monthlySummaryMap: monthSummaryMap(action.payload),
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.saveMonthlySummary: {
      return {
        ...state,
        monthlySummaryMap: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.saveMonthlySummarySuccess: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: action.payload.message
      };
    }
    case DashboardActionTypes.yearSummary: {
      return {
        ...state,
        yearSummaryMap: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.yearSummarySuccess: {
      return {
        ...state,
        yearSummaryMap: yearSummaryMap(action.payload),
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.quarterSummary: {
      return {
        ...state,
        quarterSummaryMap: null,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.quarterSummarySuccess: {
      return {
        ...state,
        quarterSummaryMap: quarterSummaryMap(action.payload),
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
