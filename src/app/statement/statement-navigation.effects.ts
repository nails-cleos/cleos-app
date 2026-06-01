import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanStatement } from '../store/statement.actions';
import { getAllMyOffices } from '../store/office.actions';
import { navigation } from '../store/router-navigation.operator';
import { StatementListComponent } from './list/statement-list.component';

@Injectable()
export class StatementNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadStatementListPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(StatementListComponent, {
        run: () => [cleanStatement(), getAllMyOffices()],
      }),
    ));
}
