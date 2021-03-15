import { All, NotificationActionTypes } from '../notification.actions';
import { INotificationDTO } from '../../interfaces/notification';

export interface State {
  data: INotificationDTO | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  error: null,
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
        data: {page: {content: [{}, {}, {}]}},
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
        error: action.payload.error,
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
