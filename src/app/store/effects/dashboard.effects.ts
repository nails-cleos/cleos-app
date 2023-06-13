import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NEVER, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import * as fromActionsDashboard from '../dashboard.actions';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';

@Injectable()
export class DashboardEffects {

  getDashEvents$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDashboard.DashboardActionTypes.dashEvents)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.dashboardService.getEvents(payload).pipe(
      switchMap((response: any) => of(new fromActionsDashboard.DashSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDashboard.DashFailure({error: err.error})))
    ))
  ));

  getEvents$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDashboard.DashboardActionTypes.dashboardEvents)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.dashboardService.meEvents(payload).pipe(
      switchMap((response: any) => of(new fromActionsDashboard.EventSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDashboard.DashFailure({error: err.error})))
    ))
  ));

  updateEvent$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDashboard.DashboardActionTypes.updateEvent)).pipe(
    map((action: any) => action.payload),
    mergeMap((payload: any) => this.dashboardService.updateEvent(payload).pipe(
      switchMap(() => NEVER),
      catchError((err: HttpErrorResponse) => of(new fromActionsDashboard.DashFailure({error: err.error})))
    ))
  ));

  getCards$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDashboard.DashboardActionTypes.dashCards)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.dashboardService.getCards(payload).pipe(
      switchMap((response: any) => of(new fromActionsDashboard.DashSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDashboard.DashFailure({error: err.error})))
    ))
  ));

  getSummary$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDashboard.DashboardActionTypes.dashSummary)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.dashboardService.getSummary(payload).pipe(
      switchMap((response: any) => of(new fromActionsDashboard.GetSummarySuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDashboard.DashFailure({error: err.error})))
    ))
  ));

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsDashboard.DashboardActionTypes.dashSuccess)
  ), {dispatch: false});

  eventSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsDashboard.DashboardActionTypes.eventSuccess)
  ), {dispatch: false});


  constructor(private readonly translate: TranslateService, private actions$: Actions, private router: Router,
              private dashboardService: DashboardService) {
  }
}
