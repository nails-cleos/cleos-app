import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { type Subscription } from 'rxjs';
import { PaymentService } from '../services/payment.service';
import { createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationService } from '../services/navigation.service';
import { IPaymentAll, IPaymentOption } from '../interfaces/payment';
import { IReservationPayment } from '../reservation/reservation';

type PaymentStoreState = StoreState<IPaymentAll[], IPaymentAll> & {
  options: IPaymentOption[];
  paths: string[] | undefined;
  paymentResultParams: {
    path: 'reservation' | 'transaction';
    id?: string;
    status?: string;
    paymentId?: string;
    preferenceId?: string;
    payerId?: string;
    token?: string;
    reason?: string;
    orderId?: string;
    orderStatusId?: string;
    paymentType?: string;
    accountId?: string;
  } | undefined;
};

const initialState: PaymentStoreState = {
  ...createStoreInitialState<IPaymentAll[], IPaymentAll>(),
  options: [],
  paths: undefined,
  paymentResultParams: undefined,
};

export const PaymentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    paymentService = inject(PaymentService),
    translateService = inject(TranslateService),
    navigationService = inject(NavigationService),
  ) => {
    let getPaymentSubscription: Subscription | undefined;
    let optionsSubscription: Subscription | undefined;
    let getPaymentByResourceIdSubscription: Subscription | undefined;
    let createPaymentLinkByReservationIdSubscription: Subscription | undefined;
    let updatePaymentByIdSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      getPaymentSubscription?.unsubscribe();
      optionsSubscription?.unsubscribe();
      getPaymentByResourceIdSubscription?.unsubscribe();
      createPaymentLinkByReservationIdSubscription?.unsubscribe();
      updatePaymentByIdSubscription?.unsubscribe();
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

      getPayment(id: string): void {
        getPaymentSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        getPaymentSubscription = paymentService.getPayment(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      getPaymentByResourceId(id: string, path: 'reservation' | 'transaction'): void {
        getPaymentByResourceIdSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        getPaymentByResourceIdSubscription = paymentService.getPaymentByResourceId(id, path).subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      createPaymentLinkByReservationId(reservationId: string, payment: IReservationPayment): void {
        createPaymentLinkByReservationIdSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        createPaymentLinkByReservationIdSubscription =
          paymentService.createPaymentLinkByReservationId(reservationId, payment).subscribe({
            next: (response) => window.open(response.link || response.paymentURL, '_self'),
            error: patchError,
          });
      },

      updatePaymentById(id: string, payment: IReservationPayment): void {
        updatePaymentByIdSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        updatePaymentByIdSubscription = paymentService.updatePayment(id, payment).subscribe({
          next: (response) => window.open(response.paymentLink, '_self'),
          error: patchError,
        });
      },

      getOptions(): void {
        optionsSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        optionsSubscription = paymentService.getPaymentOptions().subscribe({
          next: (options) => patchState(store, { options, isLoading: false }),
          error: patchError,
        });
      },
    };
  }),
);
