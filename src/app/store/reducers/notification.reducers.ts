import { All, NotificationActionTypes } from '../notification.actions';
import { INotification, INotificationDTO } from '../../interfaces/notification';
import { Pagination } from '../../interfaces/pagination';
import { IError } from '../../interfaces/common';

export interface State {
  data?: INotificationDTO | Pagination<INotification> | string;
  dataDeleted?: INotificationDTO;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  dataDeleted: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case NotificationActionTypes.getNotificationsPage: {
      return {
        ...state,
        data: { page: { content: [{}, {}, {}] } as Pagination<INotification>, unread: -1 },
        dataDeleted: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case NotificationActionTypes.notificationSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case NotificationActionTypes.notificationReadSuccess: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case NotificationActionTypes.notificationFailure: {
      return {
        ...state,
        errorMessage: action.error?.message,
        error: action.error,
        subErrors: action.error?.subErrors,
        isLoading: false,
      };
    }
    case NotificationActionTypes.readNotification: {
      return {
        ...state,
        data: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: true,
      };
    }
    case NotificationActionTypes.deleteNotification: {
      return {
        ...state,
        dataDeleted: undefined,
        data: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case NotificationActionTypes.notificationDeleteSuccess: {
      return {
        ...state,
        dataDeleted: action.data,
        errorMessage: undefined,
        subErrors: undefined,
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
