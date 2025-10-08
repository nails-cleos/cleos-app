import { Action } from '@ngrx/store';
import { IError, ResponseSuccess } from '../interfaces/common';
import {
  ICardSummary,
  IEventSummary,
  IMonthlyRoomSummary,
  IMonthlySummaryRequest,
  IRoomEvents,
  ITotal,
  IYearRoomExport,
  IYearRoomSummary,
} from '../interfaces/dashboard';
import { IReservation } from '../interfaces/reservation';

export enum DashboardActionTypes {
  getEvents = '[Dash] Events summaries',
  getCards = '[Dash] Get summaries',
  dashSuccess = '[Dash] Dash Success',
  dashFailure = '[Dash] Dash failure',
  getMyEvent = '[Dashboard] Me event',
  eventSuccess = '[Dashboard] Event success',
  updateEvent = '[Dashboard] Update event by id',
  getMonthlySummary = '[Dash] Get monthly summary',
  monthlySummarySuccess = '[Dash] Monthly summary success',
  updateMonthlySummary = '[Dash] Update monthly summary',
  saveMonthlySummarySuccess = '[Dash] Save monthly summary success',
  getYearSummary = '[Dash] Get year summary',
  yearSummarySuccess = '[Dash] Year summary success',
  exportYearSummary = '[Dash] Export year summary',
  yearExportSuccess = '[Dash] Year export success',
  getQuarterSummary = '[Dash] Get quarter summary',
  quarterSummarySuccess = '[Dash] Quarter summary success',
  clean = '[Dash] Clean'
}

export class GetEvents implements Action {
  readonly type = DashboardActionTypes.getEvents;

  constructor(public date: Date) {
  }
}

export class GetMyEvent implements Action {
  readonly type = DashboardActionTypes.getMyEvent;

  constructor(public date: Date) {
  }
}

export class EventSuccess implements Action {
  readonly type = DashboardActionTypes.eventSuccess;

  constructor(public data: IRoomEvents) {
  }
}

export class GetCards implements Action {
  readonly type = DashboardActionTypes.getCards;

  constructor(public date: Date) {
  }
}

export class DashSuccess implements Action {
  readonly type = DashboardActionTypes.dashSuccess;

  constructor(public data: IEventSummary | ICardSummary) {
  }
}

export class DashFailure implements Action {
  readonly type = DashboardActionTypes.dashFailure;

  constructor(public error: IError) {
  }
}

export class UpdateEvent implements Action {
  readonly type = DashboardActionTypes.updateEvent;

  constructor(public reservationId: string, public reservation: IReservation) {
  }
}

export class GetMonthlySummary implements Action {
  readonly type = DashboardActionTypes.getMonthlySummary;

  constructor(public date: string) {
  }
}

export class MonthlySummarySuccess implements Action {
  readonly type = DashboardActionTypes.monthlySummarySuccess;

  constructor(public monthlySummary: IMonthlyRoomSummary[]) {
  }
}

export class UpdateMonthlySummary implements Action {
  readonly type = DashboardActionTypes.updateMonthlySummary;

  constructor(public date: string, public summaryType: string, public totals: ITotal[],
              public summaries: IMonthlySummaryRequest[], public roomId: string, public step: number) {
  }
}

export class SaveMonthlySummarySuccess extends ResponseSuccess implements Action {
  readonly type = DashboardActionTypes.saveMonthlySummarySuccess;

  constructor(public date: string, public step: number, public message: string) {
    super(message);
  }
}

export class GetYearSummary implements Action {
  readonly type = DashboardActionTypes.getYearSummary;

  constructor(public year: number) {
  }
}

export class YearSummarySuccess implements Action {
  readonly type = DashboardActionTypes.yearSummarySuccess;

  constructor(public yearSummary: IYearRoomSummary[] | []) {
  }
}

export class ExportYearSummary implements Action {
  readonly type = DashboardActionTypes.exportYearSummary;

  constructor(public year: number) {
  }
}

export class YearExportSuccess implements Action {
  readonly type = DashboardActionTypes.yearExportSuccess;

  constructor(public yearExport: IYearRoomExport[] | []) {
  }
}

export class GetQuarterSummary implements Action {
  readonly type = DashboardActionTypes.getQuarterSummary;

  constructor(public year: number, public quarter: number) {
  }
}

export class QuarterSummarySuccess implements Action {
  readonly type = DashboardActionTypes.quarterSummarySuccess;

  constructor(public quarterSummary: any) {
  }
}

export class Clean implements Action {
  readonly type = DashboardActionTypes.clean;
}

export type All =
  | GetEvents
  | GetCards
  | DashSuccess
  | DashFailure
  | GetMyEvent
  | EventSuccess
  | UpdateEvent
  | GetMonthlySummary
  | MonthlySummarySuccess
  | UpdateMonthlySummary
  | SaveMonthlySummarySuccess
  | GetYearSummary
  | YearSummarySuccess
  | GetQuarterSummary
  | QuarterSummarySuccess
  | ExportYearSummary
  | YearExportSuccess
  | Clean;
