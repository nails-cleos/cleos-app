import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';
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
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class DocumentEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly documentService: DocumentService = inject(DocumentService);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getDocumentsPage),
    switchMap(({ officeId, date, page, sort, direction, size }) => effectRequest(
      this.documentService.getDocumentsPage(officeId, date, page, sort, direction, size)
        .pipe(map((page: Pagination<IDocument>) => documentSuccess({ page }))),
      action => action,
      documentFailure,
    )),
  ));

  documentView$ = createEffect(() => this.actions.pipe(
    ofType(documentView),
    switchMap(({ id, fileName }) => effectRequest(
      this.documentService.view(id).pipe(map((blob: Blob) => documentResponseSuccess({ blob, fileName }))),
      action => action,
      documentFailure,
    )),
  ));

  documentDownloadZip$ = createEffect(() => this.actions.pipe(
    ofType(documentDownloadZip),
    switchMap(({ officeId, date, fileName }) => effectRequest(
      this.documentService.documentDownloadZip(officeId, date)
        .pipe(map((blob: Blob) => documentResponseSuccess({ blob, fileName }))),
      action => action,
      documentFailure,
    )),
  ));
}
