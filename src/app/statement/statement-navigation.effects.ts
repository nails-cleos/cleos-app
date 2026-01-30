import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanStatement } from '../store/statement.actions';
import { getAllMyOffices } from '../store/office.actions';

@Injectable()
export class StatementNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  handleStatementNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;

        // 1) /statements
        const statementsMatch = url.match(/\/statements\/?$/);
        if (statementsMatch) {
          return [cleanStatement(), getAllMyOffices()];
        }

        return [];
      }),
    ));
}
