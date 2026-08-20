import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DocumentTypeEnum, IDocument } from '../document/document';
import { Pagination } from '../interfaces/pagination';
import { DocumentService } from '../services/document.service';
import { getDateFormat } from '../util/dates';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import { PageRequest } from '../interfaces/common';
import type { Subscription } from 'rxjs';

type DocumentStoreState = StoreState<Pagination<IDocument>, IDocument>;

const initialState: DocumentStoreState = createStoreInitialState<
  Pagination<IDocument>,
  IDocument
>();

export type DocumentPageRequest = PageRequest & {
  officeId: string;
  date?: Date;
  types?: DocumentTypeEnum[];
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
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, documentService = inject(DocumentService)) => {
    let loadPageSubscription: Subscription | undefined;
    let downloadSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let downloadZipSubscription: Subscription | undefined;
    let uploadStatementSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      downloadSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      downloadZipSubscription?.unsubscribe();
      uploadStatementSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
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

      clearBlob(): void {
        this.clearResponse();
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadPage({
        officeId,
        date,
        page,
        sort,
        direction,
        size,
        types,
      }: DocumentPageRequest): void {
        loadPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadPageSubscription = documentService
          .getDocumentsPage(
            officeId,
            page,
            sort,
            direction,
            size,
            date ? getDateFormat(date) : undefined,
            types,
          )
          .subscribe({
            next: (data) => patchState(store, { data, isLoading: false }),
            error: patchError,
          });
      },

      download({ id, fileName }: DocumentDownloadRequest): void {
        downloadSubscription?.unsubscribe();
        cleanCrudCreate(store);

        downloadSubscription = documentService.view(id).subscribe({
          next: (blob) =>
            patchState(store, {
              response: { blob, fileName },
              isLoading: false,
            }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = documentService.getDocument(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      downloadZip({ officeId, date, fileName }: DocumentZipRequest): void {
        downloadZipSubscription?.unsubscribe();
        cleanCrudCreate(store);

        downloadZipSubscription = documentService
          .documentDownloadZip(officeId, getDateFormat(date))
          .subscribe({
            next: (blob) =>
              patchState(store, {
                response: { blob, fileName },
                isLoading: false,
              }),
            error: patchError,
          });
      },

      delete(id: string, name: string): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = documentService.deleteDocument(id).subscribe({
          next: () =>
            patchState(store, {
              response: {
                messageKey: 'DOCUMENT.DELETED.MESSAGE',
                messageParams: {
                  name,
                },
                reload: true,
                toastType: 'warning',
              },
              isLoading: false,
            }),
          error: patchError,
        });
      },

      uploadStatement(
        officeId: string,
        blob: Blob,
        fileName: string,
        id?: string,
      ): void {
        uploadStatementSubscription?.unsubscribe();
        cleanCrudCreate(store);

        uploadStatementSubscription = documentService
          .uploadStatement(officeId, blob, fileName, id)
          .subscribe({
            next: () =>
              patchState(store, {
                response: {
                  messageKey: 'DOCUMENT.UPLOAD_SUCCESS',
                  messageParams: {
                    fileName,
                  },
                  redirect: 'statements',
                },
                isLoading: false,
              }),
            error: patchError,
          });
      },
    };
  }),
);
