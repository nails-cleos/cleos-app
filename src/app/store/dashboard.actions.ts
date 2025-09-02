import { Action } from '@ngrx/store';

export enum DashboardActionTypes {
  eventsSummaries = '[Dash] Events summaries',
  getSummaries = '[Dash] Get summaries',
  dashSuccess = '[Dash] Dash Success',
  dashFailure = '[Dash] Dash failure',
  meEvent = '[Dashboard] Me event',
  eventSuccess = '[Dashboard] Event success',
  updateEventById = '[Dashboard] Update event by id',
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

export class EventsSummaries implements Action {
  readonly type = DashboardActionTypes.eventsSummaries;

  constructor(public payload: any) {
  }
}

export class MeEvent implements Action {
  readonly type = DashboardActionTypes.meEvent;

  constructor(public payload: any) {
  }
}

export class EventSuccess implements Action {
  readonly type = DashboardActionTypes.eventSuccess;

  constructor(public payload: any) {
  }
}

export class GetSummaries implements Action {
  readonly type = DashboardActionTypes.getSummaries;

  constructor(public payload: any) {
  }
}

export class DashSuccess implements Action {
  readonly type = DashboardActionTypes.dashSuccess;

  constructor(public payload: any) {
  }
}

export class DashFailure implements Action {
  readonly type = DashboardActionTypes.dashFailure;

  constructor(public payload: any) {
  }
}

export class UpdateEventById implements Action {
  readonly type = DashboardActionTypes.updateEventById;

  constructor(public payload: any) {
  }
}

export class GetMonthlySummary implements Action {
  readonly type = DashboardActionTypes.getMonthlySummary;

  constructor(public payload: any) {
  }
}

export class MonthlySummarySuccess implements Action {
  readonly type = DashboardActionTypes.monthlySummarySuccess;

  constructor(public payload: any) {
  }
}

export class UpdateMonthlySummary implements Action {
  readonly type = DashboardActionTypes.updateMonthlySummary;

  constructor(public payload: any) {
  }
}

export class UpdateMonthlySummarySuccess implements Action {
  readonly type = DashboardActionTypes.saveMonthlySummarySuccess;

  constructor(public payload: any) {
  }
}

export class GetYearSummary implements Action {
  readonly type = DashboardActionTypes.getYearSummary;

  constructor(public payload: any) {
  }
}

export class YearSummarySuccess implements Action {
  readonly type = DashboardActionTypes.yearSummarySuccess;

  constructor(public payload: any) {
  }
}

export class ExportYearSummary implements Action {
  readonly type = DashboardActionTypes.exportYearSummary;

  constructor(public payload: any) {
  }
}

export class YearExportSuccess implements Action {
  readonly type = DashboardActionTypes.yearExportSuccess;

  constructor(public payload: any) {
  }
}

export class GetQuarterSummary implements Action {
  readonly type = DashboardActionTypes.getQuarterSummary;

  constructor(public payload: any) {
  }
}

export class QuarterSummarySuccess implements Action {
  readonly type = DashboardActionTypes.quarterSummarySuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = DashboardActionTypes.clean;
}

export type All =
  | EventsSummaries
  | GetSummaries
  | DashSuccess
  | DashFailure
  | MeEvent
  | EventSuccess
  | UpdateEventById
  | GetMonthlySummary
  | MonthlySummarySuccess
  | UpdateMonthlySummary
  | UpdateMonthlySummarySuccess
  | GetYearSummary
  | YearSummarySuccess
  | GetQuarterSummary
  | QuarterSummarySuccess
  | ExportYearSummary
  | YearExportSuccess
  | Clean;
