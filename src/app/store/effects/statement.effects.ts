import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { statementFailure, statementSaveSuccess, uploadStatement } from '../statement.actions';
import { StatementService } from '../../services/statement.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class StatementEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly statementService: StatementService = inject(StatementService);
  private readonly translateService: TranslateService = inject(TranslateService);

  uploadStatement$ = createEffect(() => this.actions.pipe(
    ofType(uploadStatement),
    switchMap(({ officeId, blob, fileName }) =>
      this.statementService.uploadStatement(officeId, blob, fileName).pipe(
        map(() => {
          const message = this.translateService.instant('STATEMENT.UPLOAD_SUCCESS', { fileName });
          return statementSaveSuccess({ message });
        }),
        catchError((err: HttpErrorResponse) => of(statementFailure({ error: err.error }))),
      )),
  ));
}
