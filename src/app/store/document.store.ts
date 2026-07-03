import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IDocument } from '../document/document';
import { Pagination } from '../interfaces/pagination';
import { DocumentService } from '../services/document.service';
import { getDateFormat } from '../util/dates';
import { cleanCrudCreate, createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import { PageRequest } from '../interfaces/common';

type DocumentStoreState = StoreState<Pagination<IDocument>>;

const initialState: DocumentStoreState = {
  ...createStoreInitialState<Pagination<IDocument>, never>(),
};

export type DocumentPageRequest = PageRequest & {
  officeId: string;
  date: Date;
};

export type DocumentDownloadRequest = {
  id: string;
  fileName: string;
};

export type DocumentZipRequest = {
  officeId: string;
  date: Date;
  fileName: string;
};

export const DocumentStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    documentService = inject(DocumentService),
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

      loadPage({ officeId, date, page, sort, direction, size }: DocumentPageRequest): void {
        patchState(store, { data: undefined, isLoading: true });

        documentService.getDocumentsPage(officeId, getDateFormat(date), page, sort, direction, size).subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      download({ id, fileName }: DocumentDownloadRequest): void {
        cleanCrudCreate(store);

        documentService.view(id).subscribe({
          next: (blob) => patchState(store, { response: { blob, fileName }, isLoading: false }),
          error: patchError,
        });
      },

      downloadZip({ officeId, date, fileName }: DocumentZipRequest): void {
        cleanCrudCreate(store);

        documentService.documentDownloadZip(officeId, getDateFormat(date)).subscribe({
          next: (blob) => patchState(store, { response: { blob, fileName }, isLoading: false }),
          error: patchError,
        });
      },
    };
  }),
);
