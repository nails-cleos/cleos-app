import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IResponseSuccess, PageRequest } from '../interfaces/common';
import { IInvoice, IInvoiceData } from '../invoice/invoice';
import { IOffice } from '../office/office';
import { Pagination } from '../interfaces/pagination';
import { InvoiceService } from '../services/invoice.service';
import { OfficeService } from '../services/office.service';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

type InvoiceStoreState = StoreState<IInvoice[], never> & {
  page: Pagination<IInvoiceData> | undefined;
};

const initialState: InvoiceStoreState = {
  ...createStoreInitialState<IInvoice[], never>(),
  page: undefined,
};

export const InvoiceStore = signalStore(
  withState(initialState),
  withMethods((store, invoiceService = inject(InvoiceService), officeService = inject(OfficeService),
    translate = inject(TranslateService)) => {
    const patchError = (err: any): void => {
      const error = mapCrudHttpError(err);
      patchState(store, {
        error,
        subErrors: error.subErrors,
        response: undefined,
        isLoading: false,
      });
    };

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
        patchState(store, {
          page: undefined,
          data: undefined,
          response: undefined,
          subErrors: undefined,
          error: undefined,
          isLoading: true,
        });

        invoiceService.getInvoicesPage(officeId, page, sort, direction, size).subscribe({
          next: (value) => patchState(store, {
            page: value,
            response: undefined,
            subErrors: undefined,
            error: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      loadOfficeToInvoice(officeId: string, start: string, end: string, types?: string[]): void {
        patchState(store, {
          data: undefined,
          page: undefined,
          response: undefined,
          subErrors: undefined,
          error: undefined,
          isLoading: true,
        });

        invoiceService.getOfficeToInvoice(officeId, start, end, types).subscribe({
          next: (data) => patchState(store, {
            data: data ?? [],
            response: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      updateOffice(id: string, office: IOffice): void {
        patchState(store, {
          response: undefined,
          subErrors: undefined,
        });

        officeService.updateOffice(id, office).subscribe({
          next: () => patchState(store, {
            response: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      uploadInvoices(officeId: string, blob: Blob, fileName: string, upload: boolean): void {
        patchState(store, {
          response: undefined,
          subErrors: undefined,
          isLoading: true,
        });

        const response: IResponseSuccess = {
          message: translate.instant('INVOICE.UPLOAD_SUCCESS', { fileName }),
          blob,
          fileName,
        };

        if (!upload) {
          patchState(store, {
            response,
            subErrors: undefined,
            isLoading: false,
          });
          return;
        }

        invoiceService.uploadInvoices(officeId, blob, fileName).subscribe({
          next: () => patchState(store, {
            response,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
