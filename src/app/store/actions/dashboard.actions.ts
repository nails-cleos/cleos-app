import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess } from '../../interfaces/common';
import {
  ICardSummary,
  IEventSummary,
  IMonthlyRoomSummary,
  IMonthlySummaryRequest,
  IRoomEvents,
  ITotal,
  IYearRoomExport,
  IYearRoomSummary,
} from '../../interfaces/dashboard';
import { IReservation } from '../../interfaces/reservation';

enum DashboardActionTypes {
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
  setMonthlyNavigationParams = '[Dash] Set monthly navigation params',
  setQuarterNavigationParams = '[Dash] Set quarter navigation params',
  setYearNavigationParams = '[Dash] Set year navigation params',
  setDashNavigationParams = '[Dash] Set dashboard navigation params',
  getYearSummary = '[Dash] Get year summary',
  yearSummarySuccess = '[Dash] Year summary success',
  exportYearSummary = '[Dash] Export year summary',
  yearExportSuccess = '[Dash] Year export success',
  getQuarterSummary = '[Dash] Get quarter summary',
  quarterSummarySuccess = '[Dash] Quarter summary success',
  clean = '[Dash] Clean'
}

export const getEvents = createAction(
  DashboardActionTypes.getEvents,
  props<{ date: Date }>(),
);

export const getMyEvent = createAction(
  DashboardActionTypes.getMyEvent,
  props<{ date: Date }>(),
);

export const eventSuccess = createAction(
  DashboardActionTypes.eventSuccess,
  props < { data: IRoomEvents }>(),
);

export const getCards = createAction(
  DashboardActionTypes.getCards,
  props<{ date: Date }>(),
);

export const dashSuccess = createAction(
  DashboardActionTypes.dashSuccess,
  props<{ data: IEventSummary[] | ICardSummary[] }>(),
);

export const dashFailure = createAction(
  DashboardActionTypes.dashFailure,
  props<{ error: IError }>(),
);

export const updateEvent = createAction(
  DashboardActionTypes.updateEvent,
  props<{ reservationId: string, reservation: IReservation }>(),
);

export const getMonthlySummary = createAction(
  DashboardActionTypes.getMonthlySummary,
  props<{ date: string }>(),
);

export const monthlySummarySuccess = createAction(
  DashboardActionTypes.monthlySummarySuccess,
  props<{ monthlySummary: IMonthlyRoomSummary[] }>(),
);

export const updateMonthlySummary = createAction(
  DashboardActionTypes.updateMonthlySummary,
  props<{
    date: string, summaryType: string, totals: ITotal[],
    summaries: IMonthlySummaryRequest[], roomId: string, step: number
  }>(),
);

export const saveMonthlySummarySuccess = createAction(
  DashboardActionTypes.saveMonthlySummarySuccess,
  props<IResponseSuccess & { date: string, step: number }>(),
);

export const setMonthlyNavigationParams = createAction(
  DashboardActionTypes.setMonthlyNavigationParams,
  props<{ step?: number, date: Date | string }>(),
);

export const setQuarterNavigationParams = createAction(
  DashboardActionTypes.setQuarterNavigationParams,
  props<{ year?: number, quarter?: number }>(),
);

export const setYearNavigationParams = createAction(
  DashboardActionTypes.setYearNavigationParams,
  props<{ year?: number }>(),
);

export const setDashNavigationParams = createAction(
  DashboardActionTypes.setDashNavigationParams,
  props<{ date?: Date, activeDayIsOpen: boolean }>(),
);

export const getYearSummary = createAction(
  DashboardActionTypes.getYearSummary,
  props<{ year: number }>(),
);

export const yearSummarySuccess = createAction(
  DashboardActionTypes.yearSummarySuccess,
  props<{ yearSummary: IYearRoomSummary[] | [] }>(),
);

export const exportYearSummary = createAction(
  DashboardActionTypes.exportYearSummary,
  props<{ year: number }>(),
);

export const yearExportSuccess = createAction(
  DashboardActionTypes.yearExportSuccess,
  props<{ yearExport: IYearRoomExport[] | [] }>(),
);

export const getQuarterSummary = createAction(
  DashboardActionTypes.getQuarterSummary,
  props<{ year: number, quarter: number }>(),
);

export const quarterSummarySuccess = createAction(
  DashboardActionTypes.quarterSummarySuccess,
  props<{ quarterSummary: any }>(),
);

export const cleanDashboard = createAction(DashboardActionTypes.clean);
