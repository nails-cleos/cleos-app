import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { DOCUMENT_FEATURE_KEY, DocumentState } from '../reducers/document.reducers';
import { Pagination } from '../../interfaces/pagination';
import { IResponseSuccess } from '../../interfaces/common';
import { IDocument } from '../../interfaces/document';

const selectDocumentState = createFeatureSelector<DocumentState>(DOCUMENT_FEATURE_KEY);

const selectDocumentsPage = createSelector(
  selectDocumentState,
  (state: DocumentState) => state?.page,
);
export const getDocumentsPagePipe = pipe(
  select(selectDocumentsPage),
  filter((val): val is Pagination<IDocument> => val !== undefined),
);

export const selectDocumentIsLoading = createSelector(
  selectDocumentState,
  (state: DocumentState) => state?.isLoading,
);

export const selectDocumentError = createSelector(
  selectDocumentState,
  (state: DocumentState) => state?.error,
);

export const selectDocumentResponse = createSelector(
  selectDocumentState,
  (state: DocumentState) => state?.response,
);
export const getDocumentResponsePipe = pipe(
  select(selectDocumentResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);
