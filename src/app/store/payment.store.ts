import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { type Subscription } from 'rxjs';
import { PaymentService } from '../services/payment.service';
import {
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IPaymentAll,
  IPaymentOption,
  IPaymentRequest,
  IPaymentResource,
  IPaymentStatus,
} from '../interfaces/payment';
import { IReservationPayment } from '../reservation/reservation';
import { ToastType } from '../shared/toast/toast.model';

type PaymentStoreState = StoreState<IPaymentResource, IPaymentAll> & {
  options: IPaymentOption[];
  paths: string[] | undefined;
  paymentResultParams:
    | {
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
      }
    | undefined;
};

const initialState: PaymentStoreState = {
  ...createStoreInitialState<IPaymentResource, IPaymentAll>(),
  options: [],
  paths: undefined,
  paymentResultParams: undefined,
};

export const PaymentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      paymentService = inject(PaymentService),
      translateService = inject(TranslateService),
    ) => {
      let getPaymentSubscription: Subscription | undefined;
      let optionsSubscription: Subscription | undefined;
      let getPaymentByResourceIdSubscription: Subscription | undefined;
      let createPaymentLinkByReservationIdSubscription:
        Subscription | undefined;
      let recreateSubscription: Subscription | undefined;
      let createSubscription: Subscription | undefined;
      let notifySubscription: Subscription | undefined;
      let updateByIdSubscription: Subscription | undefined;
      let adjustSubscription: Subscription | undefined;

      const cancelAll = (): void => {
        getPaymentSubscription?.unsubscribe();
        optionsSubscription?.unsubscribe();
        getPaymentByResourceIdSubscription?.unsubscribe();
        createPaymentLinkByReservationIdSubscription?.unsubscribe();
        recreateSubscription?.unsubscribe();
        createSubscription?.unsubscribe();
        notifySubscription?.unsubscribe();
        updateByIdSubscription?.unsubscribe();
        adjustSubscription?.unsubscribe();
      };
      const patchError = (err: HttpErrorResponse): void =>
        patchCrudError(store, err);

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
          patchState(store, { selected: undefined, isLoading: true });

          getPaymentSubscription = paymentService.getPayment(id).subscribe({
            next: (selected) =>
              patchState(store, { selected, isLoading: false }),
            error: patchError,
          });
        },

        getPaymentByResourceId(
          id: string,
          path: 'reservation' | 'transaction',
        ): void {
          getPaymentByResourceIdSubscription?.unsubscribe();
          patchState(store, { data: undefined, isLoading: true });

          getPaymentByResourceIdSubscription = paymentService
            .getPaymentByResourceId(id, path)
            .subscribe({
              next: (data) => patchState(store, { data, isLoading: false }),
              error: patchError,
            });
        },

        createPaymentLinkByReservationId(
          reservationId: string,
          payment: IReservationPayment,
        ): void {
          createPaymentLinkByReservationIdSubscription?.unsubscribe();
          patchState(store, { isLoading: true });

          createPaymentLinkByReservationIdSubscription = paymentService
            .createPaymentLinkByReservationId(reservationId, payment)
            .subscribe({
              next: (response) => {
                window.open(response.link || response.paymentURL, '_self');
                patchState(store, { isLoading: false });
              },
              error: patchError,
            });
        },

        recreate(id: string, paymentType: string): void {
          recreateSubscription?.unsubscribe();
          patchState(store, { response: undefined, isLoading: true });

          recreateSubscription = paymentService
            .recreate(id, paymentType)
            .subscribe({
              next: () =>
                patchState(store, {
                  response: {
                    message: translateService.instant('PAYMENT.RECREATE'),
                  },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        create(
          id: string,
          path: 'reservation' | 'transaction',
          status: string,
          paymentStatus: IPaymentStatus,
        ): void {
          createSubscription?.unsubscribe();
          patchState(store, {
            response: undefined,
            subErrors: undefined,
            isLoading: true,
          });

          createSubscription = paymentService
            .add(id, path, status, paymentStatus)
            .subscribe({
              next: (response) => {
                const path = response.paths?.join('/');
                let subErrors;
                let message;
                let toastType: ToastType = 'success';
                switch (response.status) {
                  case 'approved':
                    message = translateService.instant(
                      'COMMON.PAYMENT.SUCCESS',
                    );
                    break;
                  case 'pending':
                    message = translateService.instant(
                      'COMMON.PAYMENT.PENDING',
                    );
                    break;
                  default:
                    message = translateService.instant('ME.PAYMENT.ERROR', {
                      reason: response.message,
                    });
                    subErrors = [{ message }];
                    toastType = 'error';
                    break;
                }
                patchState(store, {
                  response: { message, path, toastType, redirect: path },
                  subErrors,
                  isLoading: false,
                });
              },
              error: patchError,
            });
        },

        notify(
          id: string,
          path: 'reservation' | 'transaction',
          resourceId: string,
          preferenceId: string,
          paymentType: string,
        ): void {
          notifySubscription?.unsubscribe();
          patchState(store, {
            response: undefined,
            subErrors: undefined,
            isLoading: true,
          });

          notifySubscription = paymentService
            .notifyPayment(id, path, resourceId, preferenceId, paymentType)
            .subscribe({
              next: (response) => {
                let subErrors;
                let message;
                let toastType: ToastType = 'success';
                let reload = false;
                switch (response.status) {
                  case 'approved':
                    message = translateService.instant(
                      'COMMON.PAYMENT.SUCCESS',
                    );
                    reload = true;
                    break;
                  case 'pending':
                    message = translateService.instant(
                      'COMMON.PAYMENT.PENDING',
                    );
                    break;
                  default:
                    message = translateService.instant('COMMON.PAYMENT.ERROR', {
                      reason: response.message,
                    });
                    subErrors = [{ message }];
                    toastType = 'error';
                    break;
                }
                patchState(store, {
                  response: { message, toastType, reload },
                  subErrors,
                  isLoading: false,
                });
              },
              error: patchError,
            });
        },

        updateById(id: string, payment: IReservationPayment): void {
          updateByIdSubscription?.unsubscribe();
          patchState(store, { isLoading: true });

          updateByIdSubscription = paymentService
            .updatePayment(id, payment)
            .subscribe({
              next: (response) => {
                window.open(response.paymentLink, '_self');
                patchState(store, { isLoading: false });
              },
              error: patchError,
            });
        },

        adjust(payments: IPaymentRequest[]): void {
          adjustSubscription?.unsubscribe();
          patchState(store, { response: undefined, isLoading: true });

          adjustSubscription = paymentService
            .adjustPayments(payments)
            .subscribe({
              next: () =>
                patchState(store, {
                  response: {
                    message: translateService.instant('COMMON.PAYMENT.SUCCESS'),
                    reload: true,
                  },
                  isLoading: false,
                }),
              error: patchError,
            });
        },

        notComplete(reason: string = 'incomplete'): void {
          const message = translateService.instant('ME.PAYMENT.ERROR', {
            reason,
          });
          patchState(store, { subErrors: [{ message }], isLoading: false });
        },

        getOptions(): void {
          optionsSubscription?.unsubscribe();
          patchState(store, { options: undefined, isLoading: true });

          optionsSubscription = paymentService.getPaymentOptions().subscribe({
            next: (options) => patchState(store, { options, isLoading: false }),
            error: patchError,
          });
        },
      };
    },
  ),
);
