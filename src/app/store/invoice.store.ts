import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IResponseSuccess } from '../interfaces/common';
import { IInvoice } from '../invoice/invoice';
import { InvoiceService } from '../services/invoice.service';
import {
  cleanCrudCreate,
  createStoreInitialState,
  patchCrudError,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

const initialState = createStoreInitialState<IInvoice[], never>();

export const InvoiceStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      invoiceService = inject(InvoiceService),
      translateService = inject(TranslateService),
    ) => {
      let loadPageSubscription: Subscription | undefined;
      let loadOfficeToInvoiceSubscription: Subscription | undefined;
      let uploadInvoicesSubscription: Subscription | undefined;

      const cancelAll = (): void => {
        loadPageSubscription?.unsubscribe();
        loadOfficeToInvoiceSubscription?.unsubscribe();
        uploadInvoicesSubscription?.unsubscribe();
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

        loadOfficeToInvoice(
          officeId: string,
          start: string,
          end: string,
          types?: string[],
        ): void {
          loadOfficeToInvoiceSubscription?.unsubscribe();
          patchState(store, { data: undefined, isLoading: true });

          loadOfficeToInvoiceSubscription = invoiceService
            .getOfficeToInvoice(officeId, start, end, types)
            .subscribe({
              next: (data) =>
                patchState(store, { data: data, isLoading: false }),
              error: patchError,
            });
        },

        uploadInvoices(
          officeId: string,
          blob: Blob,
          fileName: string,
          upload: boolean,
        ): void {
          uploadInvoicesSubscription?.unsubscribe();
          cleanCrudCreate(store);

          const response: IResponseSuccess = {
            message: translateService.instant('INVOICE.UPLOAD_SUCCESS', {
              fileName,
            }),
            blob,
            fileName,
          };

          if (!upload) {
            patchState(store, { response, isLoading: false });
            return;
          }

          uploadInvoicesSubscription = invoiceService
            .uploadInvoices(officeId, blob, fileName)
            .subscribe({
              next: () =>
                patchState(store, {
                  response,
                  isLoading: false,
                }),
              error: patchError,
            });
        },
      };
    },
  ),
);
