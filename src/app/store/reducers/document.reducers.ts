import {
  cleanDocument, documentDownloadZip,
  documentFailure,
  documentResponseSuccess,
  documentSuccess,
  documentView,
  getDocumentsPage,
} from '../document.actions';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { createReducer, on } from '@ngrx/store';
import { Pagination } from '../../interfaces/pagination';
import { IDocument } from '../../interfaces/document';
import { clearGlobalError, clearGlobalResponse } from '../global.actions';

export const DOCUMENT_FEATURE_KEY = 'document';

export interface DocumentState {
  response?: IResponseSuccess;
  page?: Pagination<IDocument>;
  error?: IError;
  subErrors?: IError[];
  isLoading: boolean;
}

export const initialState: DocumentState = {
  response: undefined,
  page: undefined,
  error: undefined,
  subErrors: undefined,
  isLoading: false,
};

export const documentReducer = createReducer(
  initialState,
  on(getDocumentsPage, (state) => ({
    ...state,
    page: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IDocument>,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(documentSuccess, (state, { page }) => ({
    ...state,
    page,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(documentFailure, (state, { error }) => ({
    ...state,
    error: error,
    subErrors: error.subErrors,
    response: undefined,
    isLoading: false,
  })),
  on(documentView, documentDownloadZip, (state) => ({
    ...state,
    isLoading: true,
    error: undefined,
    subErrors: undefined,
    response: undefined,
  })),
  on(documentResponseSuccess, (state, action) => ({
    ...state,
    isLoading: false,
    error: undefined,
    subErrors: undefined,
    response: action,
  })),
  on(cleanDocument, () => initialState),

  on(clearGlobalResponse, (state) => ({
    ...state,
    response: undefined,
  })),

  on(clearGlobalError, (state) => ({
    ...state,
    error: undefined,
    subErrors: undefined,
  })),
);
