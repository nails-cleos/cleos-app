import { Action } from '@ngrx/store';

export enum DashboardActionTypes {
  dashboardEvents = '[Dashboard] Get events',
  dashboardCards = '[Dashboard] Get cards',
  dashboardSuccess = '[Dashboard] Dash Success',
  dashboardFailure = '[Dashboard] Dash failure',
  clean = '[Dashboard] Clean'
}

export class GetEvents implements Action {
  readonly type = DashboardActionTypes.dashboardEvents;
}

export class GetCards implements Action {
  readonly type = DashboardActionTypes.dashboardCards;
}

export class DashboardSuccess implements Action {
  readonly type = DashboardActionTypes.dashboardSuccess;

  constructor(public payload: any) {
  }
}

export class DashboardFailure implements Action {
  readonly type = DashboardActionTypes.dashboardFailure;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = DashboardActionTypes.clean;
}

export type All =
  | GetEvents
  | GetCards
  | DashboardSuccess
  | DashboardFailure
  | Clean;
