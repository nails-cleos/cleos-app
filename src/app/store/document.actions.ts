import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IDocument } from '../interfaces/document';

enum DocumentActionTypes {
  getDocumentsPage = '[Document] Get documents page',
  documentSuccess = '[Document] Success',
  documentView = '[Document] Document view',
  documentDownloadZip = '[Document] Document download zip',
  documentResponseSuccess = '[Document] Response Success',
  documentFailure = '[Document] Failure',
  clean = '[Document] Clean'
}

export const getDocumentsPage = createAction(
  DocumentActionTypes.getDocumentsPage,
  props<{ officeId: string; date: string } & PageRequest>(),
);

export const documentView = createAction(
  DocumentActionTypes.documentView,
  props<{ id: string; fileName: string }>(),
);

export const documentDownloadZip = createAction(
  DocumentActionTypes.documentDownloadZip,
  props<{ officeId: string; date: string; fileName: string }>(),
);

export const documentSuccess = createAction(
  DocumentActionTypes.documentSuccess,
  props<{ page: Pagination<IDocument> }>(),
);

export const documentFailure = createAction(
  DocumentActionTypes.documentFailure,
  props<{ error: IError }>(),
);

export const documentResponseSuccess = createAction(
  DocumentActionTypes.documentResponseSuccess,
  props<IResponseSuccess>(),
);

export const cleanDocument = createAction(DocumentActionTypes.clean);
