import { All, DashboardActionTypes } from '../dashboard.actions';
import { ICardSummary, IEventSummary } from '../../interfaces/dashboard';

export interface State {
  data: ICardSummary | IEventSummary;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
}

const initialState: State = {
  data: {calendarSummaries: undefined, miniCardSummaries: undefined, chartSummaries: undefined},
  errorMessage: null,
  error: null,
  subErrors: null,
  message: null,
  isLoading: false
};

const merge = (a: ICardSummary | IEventSummary, b: ICardSummary | IEventSummary) => {
    const res = {};
    Object.keys({...a, ...b}).map(key => {
      // @ts-ignore
      res[key] = b[key] || a[key];
    });
    return res;
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case DashboardActionTypes.dashboardEvents: {
      return {
        ...state,
        data: {calendarSummaries: undefined},
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.dashboardCards: {
      return {
        ...state,
        data: {miniCardSummaries: undefined, chartSummaries: undefined},
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.dashboardSuccess: {
      return {
        ...state,
        data: merge(state.data, action.payload),
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case DashboardActionTypes.dashboardFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
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
