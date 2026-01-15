import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  getStatementsPage,
  statementFailure,
  statementSaveSuccess,
  statementSuccess,
  statementView,
  uploadStatement,
} from '../statement.actions';
import { StatementService } from '../../services/statement.service';
import { IStatement } from '../../interfaces/statement';
import { TranslateService } from '@ngx-translate/core';
import { Pagination } from '../../interfaces/pagination';

@Injectable()
export class StatementEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly statementService: StatementService = inject(StatementService);
  private readonly translateService: TranslateService = inject(TranslateService);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getStatementsPage),
    switchMap(({ officeId, page, sort, direction, size }) =>
      this.statementService.getStatementsPage(officeId, page, sort, direction, size).pipe(
        map((page: Pagination<IStatement>) => statementSuccess({ page })),
        catchError((err: HttpErrorResponse) => of(statementFailure({ error: err.error }))),
      )),
  ));

  statementView$ = createEffect(() => this.actions.pipe(
    ofType(statementView),
    switchMap(({ id, fileName, driveToken }) =>
      this.statementService.view(id, driveToken).pipe(
        map((blob: Blob) => statementSaveSuccess({ blob, fileName })),
        catchError((err: HttpErrorResponse) => of(statementFailure({ error: err.error }))),
      )),
  ));

  uploadStatement$ = createEffect(() => this.actions.pipe(
    ofType(uploadStatement),
    switchMap(({ officeId, blob, fileName, driveToken }) =>
      this.statementService.uploadStatement(officeId, blob, fileName, driveToken).pipe(
        map(() => {
          const message = this.translateService.instant('STATEMENT.UPLOAD_SUCCESS', { fileName });
          const redirect = 'statements';
          return statementSaveSuccess({ message, redirect });
        }),
        catchError((err: HttpErrorResponse) => of(statementFailure({ error: err.error }))),
      )),
  ));
}
