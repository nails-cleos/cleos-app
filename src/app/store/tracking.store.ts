import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TrackingService } from '../services/tracking.service';
import { createStoreInitialState, patchCrudError } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';
import { ITracking } from '../reservation/reservation';

const initialState = createStoreInitialState<never, ITracking>();

export const TrackingStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    trackingService = inject(TrackingService),
  ) => {
    let getByReservationIdSubscription: Subscription | undefined;
    let executeByReservationIdSubscription: Subscription | undefined;
    let updateByReservationIdSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      getByReservationIdSubscription?.unsubscribe();
      executeByReservationIdSubscription?.unsubscribe();
      updateByReservationIdSubscription?.unsubscribe();
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

      getByReservationId(reservationId: string): void {
        getByReservationIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        getByReservationIdSubscription = trackingService.getTrackingByReservationId(reservationId).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      executeByReservationId(reservationId: string): void {
        executeByReservationIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        executeByReservationIdSubscription = trackingService.executeTrackingByReservationId(reservationId).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      updateByReservationId(reservationId: string, started?: string, completed?: string): void {
        updateByReservationIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        updateByReservationIdSubscription =
          trackingService.updateTrackingByReservationId(reservationId, started, completed).subscribe({
            next: (selected) => patchState(store, { selected, isLoading: false }),
            error: patchError,
          });
      },
    };
  }),
);
