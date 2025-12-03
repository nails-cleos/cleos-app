import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { NOTIFICATION_FEATURE_KEY, NotificationState } from '../reducers/notification.reducers';
import { INotification, INotificationDTO } from '../../interfaces/notification';

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

const selectNotificationIsLoading = createSelector(
  selectNotificationState,
  (state: NotificationState) => state?.isLoading,
);
export const getNotificationIsLoadingPipe = pipe(
  select(selectNotificationIsLoading),
  filter((val): val is boolean => val !== undefined),
);
