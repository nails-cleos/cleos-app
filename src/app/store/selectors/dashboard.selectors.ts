import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { DASHBOARD_FEATURE_KEY, DashboardState } from '../reducers/dashboard.reducers';
import {
  IMonthlyExport,
  IMonthSummary,
  IMonthlySummaryExpense,
  IMonthlySummarySale,
  IQuarterSummary,
  ISummaryRoom, IDashboard, IRoomEvents,
} from '../../interfaces/dashboard';
import { IError } from '../../interfaces/common';

const selectDashboardState = createFeatureSelector<DashboardState>(DASHBOARD_FEATURE_KEY);

const selectMonthlySummaryMap = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.monthlySummaryMap,
);

export const getMonthlySummaryMapPipe = pipe(
  select(selectMonthlySummaryMap),
  filter((val): val is Map<ISummaryRoom, {
    summarySale: IMonthlySummarySale[];
    summaryCashSale: IMonthlySummarySale[];
    summaryExpenses: IMonthlySummaryExpense[];
  }> => val !== undefined),
);

const selectMonthlyNavigationParams = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.monthlyNavigationParams,
);

export const getMonthlyNavigationParamsPipe = pipe(
  select(selectMonthlyNavigationParams),
  filter((val): val is { step?: number, date: Date | string } => val !== undefined),
);

const selectQuarterSummaryMap = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.quarterSummaryMap,
);

export const getQuarterSummaryMapPipe = pipe(
  select(selectQuarterSummaryMap),
  filter((val): val is Map<ISummaryRoom, {
    monthSummaries: IMonthSummary[];
  }> => val !== undefined),
);

const selectQuarterNavigationParams = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.quarterNavigationParams,
);

export const getQuarterNavigationParamsPipe = pipe(
  select(selectQuarterNavigationParams),
  filter((val): val is { year?: number, quarter?: number } => val !== undefined),
);

const selectYearSummaryMap = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.yearSummaryMap,
);

export const getYearSummaryMapPipe = pipe(
  select(selectYearSummaryMap),
  filter((val): val is Map<ISummaryRoom, {
    quarterSummaries: IQuarterSummary[];
  }> => val !== undefined),
);

const selectYearExport = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.yearExport,
);

export const getYearExportPipe = pipe(
  select(selectYearExport),
  filter((val): val is Map<ISummaryRoom, {
    monthlyExport: IMonthlyExport[];
  }> => val !== undefined),
);

const selectYearNavigationParams = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.yearNavigationParams,
);

export const getYearNavigationParamsPipe = pipe(
  select(selectYearNavigationParams),
  filter((val): val is { year?: number } => val !== undefined),
);

const selectDashboardNavigationParams = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.dashNavigationParams,
);

export const getDashboardNavigationParamsPipe = pipe(
  select(selectDashboardNavigationParams),
  filter((val): val is { date?: Date, activeDayIsOpen: boolean } => val !== undefined),
);

const selectErrorPipe = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.error,
);

export const getErrorPipe = pipe(
  select(selectErrorPipe),
  filter((val): val is IError => val !== undefined),
);

const selectDashboard = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.data,
);

export const getDashboardMapPipe = pipe(
  select(selectDashboard),
  filter((val): val is Record<string, IDashboard> => val !== undefined),
);

const eventDashboard = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.dashboard,
);

export const getEventDashboardPipe = pipe(
  select(eventDashboard),
  filter((val): val is IRoomEvents => val !== undefined),
);

export const selectDashboardIsLoading = createSelector(
  selectDashboardState,
  (state: DashboardState) => state?.isLoading,
);

export const isDashboardLoadingPipe = pipe(
  select(selectDashboardIsLoading),
  filter((val): val is boolean => val !== undefined),
);
