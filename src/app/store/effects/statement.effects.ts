import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';
import { statementFailure, statementSaveSuccess, uploadStatement } from '../statement.actions';
import { StatementService } from '../../services/statement.service';
import { TranslateService } from '@ngx-translate/core';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class StatementEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly statementService: StatementService = inject(StatementService);
  private readonly translateService: TranslateService = inject(TranslateService);

  uploadStatement$ = createEffect(() => this.actions.pipe(
    ofType(uploadStatement),
    switchMap(({ officeId, blob, fileName }) => effectRequest(
      this.statementService.uploadStatement(officeId, blob, fileName).pipe(map(() => {
        const message = this.translateService.instant('STATEMENT.UPLOAD_SUCCESS', { fileName });
        return statementSaveSuccess({ message });
      })),
      action => action,
      statementFailure,
    )),
  ));
}
