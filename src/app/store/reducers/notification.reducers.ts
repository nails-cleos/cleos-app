import { All, NotificationActionTypes } from '../notification.actions';
import { INotificationDTO } from '../../interfaces/notification';

export interface State {
  data: INotificationDTO | null;
  dataDeleted: INotificationDTO | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  dataDeleted: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case NotificationActionTypes.notificationPage: {
      return {
        ...state,
        // @ts-ignore
        data: { page: { content: [{}, {}, {}] } },
        dataDeleted: null,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case NotificationActionTypes.notificationSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case NotificationActionTypes.notificationReadSuccess: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case NotificationActionTypes.notificationFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case NotificationActionTypes.notificationRead: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case NotificationActionTypes.notificationDelete: {
      return {
        ...state,
        dataDeleted: null,
        data: null,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: false
      };
    }
    case NotificationActionTypes.notificationDeleteSuccess: {
      return {
        ...state,
        dataDeleted: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case NotificationActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
