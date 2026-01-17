import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  documentDownloadZip,
  documentFailure,
  documentResponseSuccess,
  documentSuccess,
  documentView,
  getDocumentsPage,
} from '../document.actions';
import { DocumentService } from '../../services/document.service';
import { Pagination } from '../../interfaces/pagination';
import { IDocument } from '../../interfaces/document';

@Injectable()
export class DocumentEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly documentService: DocumentService = inject(DocumentService);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getDocumentsPage),
    switchMap(({ officeId, date, page, sort, direction, size }) =>
      this.documentService.getDocumentsPage(officeId, date, page, sort, direction, size).pipe(
        map((page: Pagination<IDocument>) => documentSuccess({ page })),
        catchError((err: HttpErrorResponse) => of(documentFailure({ error: err.error }))),
      )),
  ));

  documentView$ = createEffect(() => this.actions.pipe(
    ofType(documentView),
    switchMap(({ id, fileName }) =>
      this.documentService.view(id).pipe(
        map((blob: Blob) => documentResponseSuccess({ blob, fileName })),
        catchError((err: HttpErrorResponse) => of(documentFailure({ error: err.error }))),
      )),
  ));

  documentDownloadZip$ = createEffect(() => this.actions.pipe(
    ofType(documentDownloadZip),
    switchMap(({ officeId, date, fileName }) =>
      this.documentService.documentDownloadZip(officeId, date).pipe(
        map((blob: Blob) => documentResponseSuccess({ blob, fileName })),
        catchError((err: HttpErrorResponse) => of(documentFailure({ error: err.error }))),
      )),
  ));
}
