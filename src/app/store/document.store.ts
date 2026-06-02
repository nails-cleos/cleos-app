import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IError, IResponseSuccess } from '../interfaces/common';
import { IDocument } from '../interfaces/document';
import { Pagination } from '../interfaces/pagination';
import { DocumentService } from '../services/document.service';
import { getDateFormat } from '../util/dates';
import { mapCrudHttpError } from './crud-signal-store';
import { SortDirection } from '@angular/material/sort';

type DocumentStoreState = {
  response: IResponseSuccess | undefined;
  data: Pagination<IDocument> | undefined;
  error: IError | undefined;
  subErrors: IError[] | undefined;
  isLoading: boolean;
};

const initialState: DocumentStoreState = {
  response: undefined,
  data: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

export type DocumentPageRequest = {
  officeId: string;
  date: Date;
  page: number;
  sort: string;
  direction: SortDirection;
  size: number;
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
  withMethods((store, documentService = inject(DocumentService)) => ({
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
      patchState(store, {
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IDocument>,
        response: undefined,
        error: undefined,
        subErrors: undefined,
      });

      documentService.getDocumentsPage(officeId, getDateFormat(date), page, sort, direction, size).subscribe({
        next: (data) => patchState(store, {
          data,
          response: undefined,
          error: undefined,
          subErrors: undefined,
        }),
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
      });
    },

    download({ id, fileName }: DocumentDownloadRequest): void {
      patchState(store, {
        response: undefined,
        error: undefined,
        subErrors: undefined,
        isLoading: true,
      });

      documentService.view(id).subscribe({
        next: (blob) => patchState(store, {
          response: { blob, fileName },
          error: undefined,
          subErrors: undefined,
          isLoading: false,
        }),
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
      });
    },

    downloadZip({ officeId, date, fileName }: DocumentZipRequest): void {
      patchState(store, {
        response: undefined,
        error: undefined,
        subErrors: undefined,
        isLoading: true,
      });

      documentService.documentDownloadZip(officeId, getDateFormat(date)).subscribe({
        next: (blob) => patchState(store, {
          response: { blob, fileName },
          error: undefined,
          subErrors: undefined,
          isLoading: false,
        }),
        error: (err) => {
          const error = mapCrudHttpError(err);
          patchState(store, {
            error,
            subErrors: error.subErrors,
            response: undefined,
            isLoading: false,
          });
        },
      });
    },
  })),
);
