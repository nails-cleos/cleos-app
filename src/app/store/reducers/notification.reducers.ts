import { All, NotificationActionTypes } from '../notification.actions';
import { INotification } from '../../interfaces/notification';
import { Pagination } from '../../interfaces/pagination';

export interface State {
  data: INotification[] | Pagination<INotification> | null;
  errorMessage: string | null;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  subErrors: null,
  message: null,
  isLoading: false
};

export function reducer(state = initialState, action: All): State {
  switch (action.type) {
    case NotificationActionTypes.NOTIFICATION_PAGE: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case NotificationActionTypes.NOTIFICATION: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case NotificationActionTypes.NOTIFICATION_SUCCESS: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case NotificationActionTypes.NOTIFICATION_READ_SUCCESS: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case NotificationActionTypes.NOTIFICATION_FAILURE: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case NotificationActionTypes.NOTIFICATION_READ: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case NotificationActionTypes.CLEAN: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}
