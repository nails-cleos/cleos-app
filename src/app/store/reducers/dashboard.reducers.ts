import { All, DashboardActionTypes } from '../dashboard.actions';
import { IDashboard, IRoomEvents } from '../../interfaces/dashboard';

export interface State {
  data: Map<string, IDashboard>;
  dashboard: IRoomEvents | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
}

const initialState: State = {
  data: new Map<string, IDashboard>(),
  dashboard: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  message: null,
  isLoading: false
};

const merge = (a: IDashboard, b: IDashboard) => {
  const res = {};
  Object.keys({...a, ...b}).map(key => {
    // @ts-ignore
    res[key] = b[key] || a[key];
  });
  return res;
};

const getMap = (a: Map<string, IDashboard>, b: IDashboard) => {
  const res = a;
  Object.keys({...a, ...b}).map(key => {
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
        dashboard: {availability: {}},
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
    case DashboardActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
