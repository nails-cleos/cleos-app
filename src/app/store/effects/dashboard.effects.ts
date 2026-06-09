import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NEVER, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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
} from '../actions/dashboard.actions';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { effectRequest } from '../../util/rxjs';
import {
  ICardSummary,
  IEventSummary,
  IMonthlyRoomSummary,
  IQuarterRoomSummary,
  IRoomEvents,
  IYearRoomExport,
  IYearRoomSummary,
} from '../../dashboard/dashboard';

@Injectable()
export class DashboardEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly router: Router = inject(Router);
  private readonly dashboardService: DashboardService = inject(DashboardService);
  private readonly navigationService: NavigationService = inject(NavigationService);

  getDashEvents$ = createEffect(() => this.actions.pipe(
    ofType(getEvents),
    switchMap(({ date }) => effectRequest(
      this.dashboardService.getEvents(date).pipe(map((data: IEventSummary[]) =>
        dashSuccess(data ? { data } : { data: [] }))),
      action => action,
      dashFailure,
    )),
  ));

  getEvents$ = createEffect(() => this.actions.pipe(
    ofType(getMyEvent),
    switchMap(({ date }) => effectRequest(
      this.dashboardService.getMyEvent(date).pipe(map((data: IRoomEvents) => eventSuccess({ data }))),
      action => action,
      dashFailure,
    )),
  ));

  updateEvent$ = createEffect(() => this.actions.pipe(
    ofType(updateEvent),
    switchMap(({ reservation, reservationId }) => effectRequest(
      this.dashboardService.updateEvent(reservationId, reservation).pipe(switchMap(() => NEVER)),
      action => action,
      dashFailure,
    )),
  ));

  getCards$ = createEffect(() => this.actions.pipe(
    ofType(getCards),
    switchMap(({ date }) => effectRequest(
      this.dashboardService.getCards(date).pipe(map((data: ICardSummary[]) =>
        dashSuccess(data ? { data } : { data: [] }))),
      action => action,
      dashFailure,
    )),
  ));

  getSummary$ = createEffect(() => this.actions.pipe(
    ofType(getMonthlySummary),
    switchMap(({ date }) => effectRequest(
      this.dashboardService.getMonthlySummary(date).pipe(map((monthlySummary: IMonthlyRoomSummary[]) =>
        monthlySummarySuccess(monthlySummary ? { monthlySummary } : { monthlySummary: [] }))),
      action => action,
      dashFailure,
    )),
  ));

  saveMonthlySummary$ = createEffect(() => this.actions.pipe(
    ofType(updateMonthlySummary),
    switchMap(({ date, summaryType, totals, summaries, roomId, step }) => effectRequest(
      this.dashboardService.updateMonthlySummary(date, summaryType, totals, summaries, roomId)
        .pipe(map(() => saveMonthlySummarySuccess({
          date, step, message: 'SUMMARY.UPDATED',
        }))),
      action => action,
      dashFailure,
    )),
  ));

  getYearSummary$ = createEffect(() => this.actions.pipe(
    ofType(getYearSummary),
    switchMap(({ year }) => effectRequest(
      this.dashboardService.getYearSummary(year).pipe(map((yearSummary: IYearRoomSummary[]) =>
        yearSummarySuccess(yearSummary ? { yearSummary } : { yearSummary: [] }))),
      action => action,
      dashFailure,
    )),
  ));

  getYearExport$ = createEffect(() => this.actions.pipe(
    ofType(exportYearSummary),
    switchMap(({ year }) => effectRequest(
      this.dashboardService.exportYearSummary(year).pipe(switchMap((yearExport: IYearRoomExport[]) => of(
        yearExportSuccess(yearExport ? { yearExport } : { yearExport: [] })))),
      action => action,
      dashFailure,
    )),
  ));

  getQuarterSummary$ = createEffect(() => this.actions.pipe(
    ofType(getQuarterSummary),
    switchMap(({ year, quarter }) => effectRequest(
      this.dashboardService.getQuarterSummary(year, quarter).pipe(switchMap((quarterSummary: IQuarterRoomSummary[]) =>
        of(quarterSummarySuccess(quarterSummary ? { quarterSummary } : { quarterSummary: [] })))),
      action => action,
      dashFailure,
    )),
  ));

  saveMonthlySummarySuccess$ = createEffect(() => this.actions.pipe(
    ofType(saveMonthlySummarySuccess),
    tap(({ date, step }) => this.navigationService.reload(this.router.url.split('/'),
      { date: date, step: step }, null, '/dashboard/quarter/summary')),
  ), { dispatch: false });
}
