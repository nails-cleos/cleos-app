import { All, DashboardActionTypes } from '../dashboard.actions';
import { IDashboard } from '../../interfaces/dashboard';

export interface State {
  data: Map<string, IDashboard>;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
}

const initialState: State = {
  data: new Map<string, IDashboard>(),
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
  const res = new Map<string, IDashboard>();
  Object.keys({...a, ...b}).map(key => {
    // @ts-ignore
    const data = b[key];
    const values = a.get(data.roomName);
    res.set(data.roomName, merge(data, values || {}));
  });
  return res;
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case DashboardActionTypes.dashboardEvents: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.dashboardCards: {
      return {
        ...state,
        errorMessage: null,
        error: null,
        subErrors: null,
        message: null
      };
    }
    case DashboardActionTypes.dashboardSuccess: {
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
