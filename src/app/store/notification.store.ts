import { createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { INotification, INotificationDTO } from '../notification/notification';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { PageRequest } from '../interfaces/common';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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
  withState(initialState),
  withMethods((
    store,
    notificationService = inject(NotificationService),
    router = inject(Router),
  ) => {
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadPage(request: PageRequest): void {
        patchState(store, { data: undefined, isLoading: true });

        notificationService.getNotificationsPage(request.page, request.sort, request.direction, request.size)
          .subscribe({
            next: (data) => patchState(store, { data, isLoading: false }),
            error: patchError,
          });
      },

      readNotification(id: string): void {
        patchState(store, { dataRead: undefined, isLoading: true });

        notificationService.readNotification(id).subscribe({
          next: (dataRead) => {
            patchState(store, { dataRead, isLoading: false });

            if (dataRead?.navigation) {
              router.navigate([dataRead.navigation]);
            }
          },
          error: patchError,
        });
      },

      deleteNotification(notification: INotification): void {
        patchState(store, { dataDeleted: undefined, isLoading: true });

        notificationService.deleteNotification(notification.id).subscribe({
          next: () => patchState(store, { dataDeleted: notification, isLoading: false }),
          error: patchError,
        });
      },

      subscribeNotification(token: string): void {
        patchState(store, { isLoading: true });

        notificationService.subscribeNotification(token).subscribe({
          next: () => patchState(store, { isLoading: false }),
          error: patchError,
        });
      },
    };
  }),
);
