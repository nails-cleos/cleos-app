import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NEVER, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  DashboardActionTypes,
  DashFailure,
  DashSuccess,
  GetEvents, EventSuccess,
  ExportYearSummary,
  GetMonthlySummary,
  GetQuarterSummary,
  GetCards,
  GetYearSummary,
  GetMyEvent,
  MonthlySummarySuccess,
  QuarterSummarySuccess,
  SaveMonthlySummarySuccess,
  UpdateEvent,
  UpdateMonthlySummary,
  YearExportSuccess,
  YearSummarySuccess,
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

  getDashEvents$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.getEvents),
    switchMap((action: GetEvents) =>
      this.dashboardService.getEvents(action.date).pipe(
        switchMap((response: IEventSummary) => of(
          new DashSuccess(response ? response : [] as IEventSummary))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  getEvents$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.getMyEvent),
    switchMap((action: GetMyEvent) =>
      this.dashboardService.getMyEvent(action.date).pipe(
        switchMap((response: IRoomEvents) => of(
          new EventSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  updateEvent$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.updateEvent),
    switchMap((action: UpdateEvent) =>
      this.dashboardService.updateEvent(action.reservationId, action.reservation).pipe(
        switchMap(() => NEVER),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  getCards$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.getCards),
    switchMap((action: GetCards) =>
      this.dashboardService.getCards(action.date).pipe(
        switchMap((response: ICardSummary) => of(
          new DashSuccess(response ? response : [] as ICardSummary))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  getSummary$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.getMonthlySummary),
    switchMap((action: GetMonthlySummary) =>
      this.dashboardService.getMonthlySummary(action.date).pipe(
        switchMap((response: IMonthlyRoomSummary[]) => of(
          new MonthlySummarySuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  saveMonthlySummary$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.updateMonthlySummary),
    switchMap((action: UpdateMonthlySummary) =>
      this.dashboardService.updateMonthlySummary(action.date, action.summaryType, action.totals, action.summaries,
        action.roomId).pipe(
        switchMap(() => of(new SaveMonthlySummarySuccess(action.date, action.step,
          this.translate.instant('SUMMARY.UPDATED')))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  getYearSummary$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.getYearSummary),
    switchMap((action: GetYearSummary) =>
      this.dashboardService.getYearSummary(action.year).pipe(
        switchMap(
          (response: IYearRoomSummary[]) => of(new YearSummarySuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  getYearExport$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.exportYearSummary),
    switchMap((action: ExportYearSummary) =>
      this.dashboardService.exportYearSummary(action.year).pipe(
        switchMap(
          (response: IYearRoomExport[]) => of(new YearExportSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  getQuarterSummary$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.getQuarterSummary),
    switchMap((action: GetQuarterSummary) =>
      this.dashboardService.getQuarterSummary(action.year, action.quarter).pipe(
        switchMap(
          (response: IQuarterRoomSummary[]) => of(
            new QuarterSummarySuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new DashFailure(err.error))),
      )),
  ));

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.dashSuccess),
  ), { dispatch: false });

  eventSuccess$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.eventSuccess),
  ), { dispatch: false });

  saveMonthlySummarySuccess$ = createEffect(() => this.actions.pipe(
    ofType(DashboardActionTypes.saveMonthlySummarySuccess),
    tap((data: SaveMonthlySummarySuccess) => this.navigationService.reload(this.router.url.split('/'),
      { date: data.date, step: data.step }, null, '/dashboard/quarter/summary')),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private router: Router,
              private dashboardService: DashboardService, private navigationService: NavigationService) {
  }
}
