import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NEVER, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  dashFailure,
  dashSuccess,
  eventSuccess,
  exportYearSummary,
  getCards,
  getEvents,
  getMonthlySummary,
  getMyEvent,
  getQuarterSummary,
  getYearSummary,
  monthlySummarySuccess,
  quarterSummarySuccess,
  saveMonthlySummarySuccess,
  updateEvent,
  updateMonthlySummary,
  yearExportSuccess,
  yearSummarySuccess,
} from '../dashboard.actions';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import {
  ICardSummary,
  IEventSummary,
  IMonthlyRoomSummary,
  IQuarterRoomSummary,
  IRoomEvents,
  IYearRoomExport,
  IYearRoomSummary,
} from '../../interfaces/dashboard';

@Injectable()
export class DashboardEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly router: Router = inject(Router);
  private readonly dashboardService: DashboardService = inject(DashboardService);
  private readonly navigationService: NavigationService = inject(NavigationService);

  getDashEvents$ = createEffect(() => this.actions.pipe(
    ofType(getEvents),
    switchMap(({ date }) => this.dashboardService.getEvents(date).pipe(
      map((data: IEventSummary) => dashSuccess(data ? { data } : { data: [] as IEventSummary })),
      catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
    )),
  ));

  getEvents$ = createEffect(() => this.actions.pipe(
    ofType(getMyEvent),
    switchMap(({ date }) => this.dashboardService.getMyEvent(date).pipe(
      map((data: IRoomEvents) => eventSuccess({ data })),
      catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
    )),
  ));

  updateEvent$ = createEffect(() => this.actions.pipe(
    ofType(updateEvent),
    switchMap(({ reservation, reservationId }) =>
      this.dashboardService.updateEvent(reservationId, reservation).pipe(
        switchMap(() => NEVER),
        catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
      )),
  ));

  getCards$ = createEffect(() => this.actions.pipe(
    ofType(getCards),
    switchMap(({ date }) => this.dashboardService.getCards(date).pipe(
      map((data: ICardSummary) => dashSuccess(data ? { data } : { data: [] as ICardSummary })),
      catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
    )),
  ));

  getSummary$ = createEffect(() => this.actions.pipe(
    ofType(getMonthlySummary),
    switchMap(({ date }) => this.dashboardService.getMonthlySummary(date).pipe(
      map((monthlySummary: IMonthlyRoomSummary[]) => monthlySummarySuccess(
        monthlySummary ? { monthlySummary } : { monthlySummary: [] })),
      catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
    )),
  ));

  saveMonthlySummary$ = createEffect(() => this.actions.pipe(
    ofType(updateMonthlySummary),
    switchMap(({ date, summaryType, totals, summaries, roomId, step }) =>
      this.dashboardService.updateMonthlySummary(date, summaryType, totals, summaries, roomId).pipe(
        map(() => saveMonthlySummarySuccess({
          date, step, message: this.translate.instant('SUMMARY.UPDATED'),
        })),
        catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
      )),
  ));

  getYearSummary$ = createEffect(() => this.actions.pipe(
    ofType(getYearSummary),
    switchMap(({ year }) => this.dashboardService.getYearSummary(year).pipe(
      map((yearSummary: IYearRoomSummary[]) => yearSummarySuccess(yearSummary ? { yearSummary } : { yearSummary: [] })),
      catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
    )),
  ));

  getYearExport$ = createEffect(() => this.actions.pipe(
    ofType(exportYearSummary),
    switchMap(({ year }) =>
      this.dashboardService.exportYearSummary(year).pipe(
        switchMap((yearExport: IYearRoomExport[]) => of(
          yearExportSuccess(yearExport ? { yearExport } : { yearExport: [] }))),
        catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
      )),
  ));

  getQuarterSummary$ = createEffect(() => this.actions.pipe(
    ofType(getQuarterSummary),
    switchMap(({ year, quarter }) =>
      this.dashboardService.getQuarterSummary(year, quarter).pipe(
        switchMap((quarterSummary: IQuarterRoomSummary[]) => of(
          quarterSummarySuccess(quarterSummary ? { quarterSummary } : { quarterSummary: [] }))),
        catchError((err: HttpErrorResponse) => of(dashFailure({ error: err.error }))),
      )),
  ));

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(dashSuccess),
  ), { dispatch: false });

  eventSuccess$ = createEffect(() => this.actions.pipe(
    ofType(eventSuccess),
  ), { dispatch: false });

  saveMonthlySummarySuccess$ = createEffect(() => this.actions.pipe(
    ofType(saveMonthlySummarySuccess),
    tap(({ date, step }) => this.navigationService.reload(this.router.url.split('/'),
      { date: date, step: step }, null, '/dashboard/quarter/summary')),
  ), { dispatch: false });
}
