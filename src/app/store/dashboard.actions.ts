import { Action } from '@ngrx/store';

export enum DashboardActionTypes {
  dashEvents = '[Dash] Get events',
  dashCards = '[Dash] Get cards',
  dashSuccess = '[Dash] Dash Success',
  dashFailure = '[Dash] Dash failure',
  dashboardEvents = '[Dashboard] Get events',
  eventSuccess = '[Dashboard] Event success',
  updateEvent = '[Dashboard] Update event',
  monthlySummary = '[Dash] Get monthly summary',
  monthlySummarySuccess = '[Dash] Monthly summary success',
  saveMonthlySummary = '[Dash] Save Monthly summary',
  saveMonthlySummarySuccess = '[Dash] Save monthly summary success',
  clean = '[Dash] Clean'
}

export class GetEvents implements Action {
  readonly type = DashboardActionTypes.dashEvents;

  constructor(public payload: any) {
  }
}

export class GetDashboardEvents implements Action {
  readonly type = DashboardActionTypes.dashboardEvents;

  constructor(public payload: any) {
  }
}

export class EventSuccess implements Action {
  readonly type = DashboardActionTypes.eventSuccess;

  constructor(public payload: any) {
  }
}

export class GetCards implements Action {
  readonly type = DashboardActionTypes.dashCards;

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

export class UpdateEvent implements Action {
  readonly type = DashboardActionTypes.updateEvent;

  constructor(public payload: any) {
  }
}

export class GetMonthlySummary implements Action {
  readonly type = DashboardActionTypes.monthlySummary;

  constructor(public payload: any) {
  }
}

export class GetMonthlySummarySuccess implements Action {
  readonly type = DashboardActionTypes.monthlySummarySuccess;

  constructor(public payload: any) {
  }
}

export class UpdateMonthlySummary implements Action {
  readonly type = DashboardActionTypes.saveMonthlySummary;

  constructor(public payload: any) {
  }
}

export class UpdateMonthlySummarySuccess implements Action {
  readonly type = DashboardActionTypes.saveMonthlySummarySuccess;

  constructor(public payload: any) {
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
  | GetDashboardEvents
  | EventSuccess
  | UpdateEvent
  | GetMonthlySummary
  | GetMonthlySummarySuccess
  | UpdateMonthlySummary
  | UpdateMonthlySummarySuccess
  | Clean;
