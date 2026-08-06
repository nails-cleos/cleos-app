import { createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { INotification, INotificationDTO } from '../notification/notification';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { PageRequest } from '../interfaces/common';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

type NotificationStoreState = StoreState<INotificationDTO, INotificationDTO> & {
  dataDeleted: INotification | undefined;
  dataRead: INotification | undefined;
}

const initialState: NotificationStoreState = {
  ...createStoreInitialState<INotificationDTO, INotificationDTO>(),
  dataDeleted: undefined,
  dataRead: undefined,
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    notificationService = inject(NotificationService),
    router = inject(Router),
  ) => {
    let loadPageSubscription: Subscription | undefined;
    let readSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;
    let subscribeNotificationSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      readSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
      subscribeNotificationSubscription?.unsubscribe();
    };
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadPage({ page, sort, direction, size }: PageRequest): void {
        loadPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadPageSubscription = notificationService
          .getNotificationsPage(page, sort, direction, size).subscribe({
            next: (data) => patchState(store, { data, isLoading: false }),
            error: patchError,
          });
      },

      read(id: string): void {
        readSubscription?.unsubscribe();
        patchState(store, { dataRead: undefined, isLoading: true });

        readSubscription = notificationService.readNotification(id).subscribe({
          next: (dataRead) => {
            patchState(store, { dataRead, isLoading: false });

            if (dataRead?.navigation) {
              router.navigate([dataRead.navigation]);
            }
          },
          error: patchError,
        });
      },

      delete(notification: INotification): void {
        deleteSubscription?.unsubscribe();
        patchState(store, { dataDeleted: undefined, isLoading: true });

        deleteSubscription = notificationService.deleteNotification(notification.id).subscribe({
          next: () => patchState(store, { dataDeleted: notification, isLoading: false }),
          error: patchError,
        });
      },

      subscribeNotification(token: string): void {
        subscribeNotificationSubscription?.unsubscribe();
        patchState(store, { isLoading: true });

        subscribeNotificationSubscription = notificationService.subscribeNotification(token).subscribe({
          next: () => patchState(store, { isLoading: false }),
          error: patchError,
        });
      },
    };
  }),
);
