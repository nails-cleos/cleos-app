import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IResponseSuccess, PageRequest } from '../interfaces/common';
import { IInvoice, IInvoiceData } from '../invoice/invoice';
import { Pagination } from '../interfaces/pagination';
import { InvoiceService } from '../services/invoice.service';
import { cleanCrudCreate, createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

type InvoiceStoreState = StoreState<IInvoice[], never> & {
  page: Pagination<IInvoiceData> | undefined;
};

const initialState: InvoiceStoreState = {
  ...createStoreInitialState<IInvoice[], never>(),
  page: undefined,
};

export const InvoiceStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    invoiceService = inject(InvoiceService),
    translateService = inject(TranslateService),
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

      loadPage({ sort, direction, page, size, officeId }: PageRequest & { officeId: string }): void {
        patchState(store, { page: undefined, isLoading: true });

        invoiceService.getInvoicesPage(officeId, page, sort, direction, size).subscribe({
          next: (page) => patchState(store, { page, isLoading: false }),
          error: patchError,
        });
      },

      loadOfficeToInvoice(officeId: string, start: string, end: string, types?: string[]): void {
        patchState(store, { data: undefined, isLoading: true });

        invoiceService.getOfficeToInvoice(officeId, start, end, types).subscribe({
          next: (data) => patchState(store, { data: data, isLoading: false }),
          error: patchError,
        });
      },

      uploadInvoices(officeId: string, blob: Blob, fileName: string, upload: boolean): void {
        cleanCrudCreate(store);

        const response: IResponseSuccess = {
          message: translateService.instant('INVOICE.UPLOAD_SUCCESS', { fileName }),
          blob,
          fileName,
        };

        if (!upload) {
          patchState(store, {
            response,
            isLoading: false,
          });
          return;
        }

        invoiceService.uploadInvoices(officeId, blob, fileName).subscribe({
          next: () => patchState(store, {
            response,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
