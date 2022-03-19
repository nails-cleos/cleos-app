import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as fromActionsDashboard from '../dashboard.actions';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';

@Injectable()
export class DashboardEffects {

  getEvents$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDashboard.DashboardActionTypes.dashboardEvents)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.dashboardService.getEvents(payload).pipe(
      switchMap((response: any) => of(new fromActionsDashboard.DashboardSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDashboard.DashboardFailure({error: err.error})))
    ))
  ));

  getCards$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDashboard.DashboardActionTypes.dashboardCards)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.dashboardService.getCards(payload).pipe(
      switchMap((response: any) => of(new fromActionsDashboard.DashboardSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDashboard.DashboardFailure({error: err.error})))
    ))
  ));

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsDashboard.DashboardActionTypes.dashboardSuccess)
  ), {dispatch: false});


  constructor(private readonly translate: TranslateService, private actions$: Actions, private router: Router,
              private dashboardService: DashboardService) {
  }
}
