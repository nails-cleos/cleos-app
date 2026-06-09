import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { NOTIFICATION_FEATURE_KEY, NotificationState } from '../reducers/notification.reducers';
import { INotification, INotificationDTO } from '../../notification/notification';

const selectNotificationState = createFeatureSelector<NotificationState>(NOTIFICATION_FEATURE_KEY);

const selectNotifications = createSelector(
  selectNotificationState,
  (state: NotificationState) => state?.data,
);
export const getNotificationsPipe = pipe(
  select(selectNotifications),
  filter((val): val is INotificationDTO => val !== undefined),
);

const selectDataDeleted = createSelector(
  selectNotificationState,
  (state: NotificationState) => state?.dataDeleted,
);
export const getDataDeletedPipe = pipe(
  select(selectDataDeleted),
  filter((val): val is INotification => val !== undefined),
);

const selectDataRead = createSelector(
  selectNotificationState,
  (state: NotificationState) => state?.dataRead,
);
export const getDataReadPipe = pipe(
  select(selectDataRead),
  filter((val): val is INotification => val !== undefined),
);

export const selectNotificationIsLoading = createSelector(
  selectNotificationState,
  (state: NotificationState) => state?.isLoading,
);
