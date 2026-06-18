import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DashboardService } from '../services/dashboard.service';
import {
  IDashboard,
  IMonthlyExport,
  IMonthlyRoomSummary,
  IMonthlySummaryExpense,
  IMonthlySummaryRequest,
  IMonthlySummarySale,
  IMonthSummary,
  IQuarterRoomSummary,
  IQuarterSummary,
  IRoomEvents,
  ISummaryRoom,
  ISummaryTotal,
  ITotal,
  IYearRoomExport,
  IYearRoomSummary,
  MonthSummary,
  QuarterSummary,
} from '../dashboard/dashboard';
import { createStoreInitialState, patchCrudError, StoreState } from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import { getMonth } from '../util/dates';
import type { Subscription } from 'rxjs';
import { IReservation } from '../reservation/reservation';
import { NavigationService } from '../services/navigation.service';
import { Router } from '@angular/router';

type DashboardStoreState = StoreState<Record<string, IDashboard>> & {
  dashboard: IRoomEvents | undefined;
  monthlySummaryMap: Map<ISummaryRoom,
    {
      summarySale: IMonthlySummarySale[];
      summaryCashSale: IMonthlySummarySale[];
      summaryExpenses: IMonthlySummaryExpense[]
    }> | undefined;
  yearSummaryMap: Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }> | undefined;
  quarterSummaryMap: Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }> | undefined;
  yearExport: Map<ISummaryRoom, { monthlyExport: IMonthlyExport[]; }> | undefined;
  monthlyNavigationParams: { step?: number, date: Date | string } | undefined;
  quarterNavigationParams: { year?: number, quarter?: number } | undefined;
  yearNavigationParams: { year?: number } | undefined;
  dashNavigationParams: { date?: Date, activeDayIsOpen: boolean } | undefined;
};

const initialState: DashboardStoreState = {
  ...createStoreInitialState<Record<string, IDashboard>, never>(),
  dashboard: undefined,
  monthlySummaryMap: undefined,
  yearSummaryMap: undefined,
  quarterSummaryMap: undefined,
  yearExport: undefined,
  monthlyNavigationParams: undefined,
  quarterNavigationParams: undefined,
  yearNavigationParams: undefined,
  dashNavigationParams: undefined,
};

export const DashboardStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    dashboardService = inject(DashboardService),
    navigationService = inject(NavigationService),
    router = inject(Router),
  ) => {
    let getEventsSubscription: Subscription | undefined;
    let getCardsSubscription: Subscription | undefined;
    let getMyEventSubscription: Subscription | undefined;
    let updateEventSubscription: Subscription | undefined;
    let getMonthlySummarySubscription: Subscription | undefined;
    let updateMonthlySummarySubscription: Subscription | undefined;
    let getYearSummarySubscription: Subscription | undefined;
    let exportYearSummarySubscription: Subscription | undefined;
    let getQuarterSummarySubscription: Subscription | undefined;

    const cancelAll = (): void => {
      getEventsSubscription?.unsubscribe();
      getCardsSubscription?.unsubscribe();
      getMyEventSubscription?.unsubscribe();
      updateEventSubscription?.unsubscribe();
      getMonthlySummarySubscription?.unsubscribe();
      updateMonthlySummarySubscription?.unsubscribe();
      getYearSummarySubscription?.unsubscribe();
      exportYearSummarySubscription?.unsubscribe();
      getQuarterSummarySubscription?.unsubscribe();
    };

    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      getEvents(date: Date): void {
        getEventsSubscription?.unsubscribe();
        patchState(store, {
          data: cleanEventMap(store.data()),
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        getEventsSubscription = dashboardService
          .getEvents(date)
          .subscribe({
            next: (eventSummaries) => {
              const data = mergeDashboard(store.data(), eventSummaries);
              patchState(store, { data, isLoading: false });
            },
            error: patchError,
          });
      },

      getCards(date: Date): void {
        getCardsSubscription?.unsubscribe();
        patchState(store, {
          data: cleanCardMap(store.data()),
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        getCardsSubscription = dashboardService
          .getCards(date)
          .subscribe({
            next: (cardSummaries) => {
              const data = mergeDashboard(store.data(), cardSummaries);
              patchState(store, { data, isLoading: false });
            },
            error: patchError,
          });
      },

      getMyEvent(date: Date): void {
        getMyEventSubscription?.unsubscribe();
        patchState(store, {
          dashboard: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        getMyEventSubscription = dashboardService
          .getMyEvent(date)
          .subscribe({
            next: (dashboard) => patchState(store, { dashboard, isLoading: false }),
            error: patchError,
          });
      },

      updateEvent(reservationId: string, reservation: IReservation): void {
        updateEventSubscription?.unsubscribe();
        patchState(store, {
          dashboard: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        updateEventSubscription = dashboardService
          .updateEvent(reservationId, reservation)
          .subscribe({
            next: () => patchState(store, { isLoading: false }),
            error: patchError,
          });
      },

      getMonthlySummary(date: string): void {
        getMonthlySummarySubscription?.unsubscribe();
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        getMonthlySummarySubscription = dashboardService
          .getMonthlySummary(date)
          .subscribe({
            next: (monthlySummaries) => patchState(store,
              { monthlySummaryMap: monthSummaryMap(monthlySummaries), isLoading: false }),
            error: patchError,
          });
      },

      updateMonthlySummary(
        date: string,
        type: string,
        totals: ITotal[],
        summaries: IMonthlySummaryRequest[],
        roomId: string | undefined,
        step: number,
      ): void {
        updateMonthlySummarySubscription?.unsubscribe();
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        updateMonthlySummarySubscription = dashboardService
          .updateMonthlySummary(date, type, totals, summaries, roomId)
          .subscribe({
            next: () => {
              patchState(store, { isLoading: false, response: { message: 'SUMMARY.UPDATED' } });
              navigationService.reload(router.url.split('/'),
                { date: date, step: step }, null, '/dashboard/quarter/summary');
            },
            error: patchError,
          });
      },

      getYearSummary(year: number): void {
        getYearSummarySubscription?.unsubscribe();
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        getYearSummarySubscription = dashboardService
          .getYearSummary(year)
          .subscribe({
            next: (yearSummaries) => patchState(store,
              { yearSummaryMap: yearSummaryMap(yearSummaries), isLoading: false }),
            error: patchError,
          });
      },

      exportYearSummary(year: number): void {
        exportYearSummarySubscription?.unsubscribe();
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        exportYearSummarySubscription = dashboardService
          .exportYearSummary(year)
          .subscribe({
            next: (yearExports) => patchState(store,
              { yearExport: yearExportMap(yearExports), isLoading: false }),
            error: patchError,
          });
      },

      getQuarterSummary(year: number, quarter: number): void {
        getQuarterSummarySubscription?.unsubscribe();
        patchState(store, {
          data: undefined,
          subErrors: undefined,
          response: undefined,
          error: undefined,
          isLoading: true,
        });

        getQuarterSummarySubscription = dashboardService
          .getQuarterSummary(year, quarter)
          .subscribe({
            next: (quarterSummaries) => patchState(store,
              { quarterSummaryMap: quarterSummaryMap(quarterSummaries), isLoading: false }),
            error: patchError,
          });
      },
    };
  }),
);

const mergeDashboard = (
  record?: Record<string, IDashboard>,
  dashboards?: IDashboard[],
): Record<string, IDashboard> => {

  const result = { ...record };

  dashboards?.forEach(data => {
    const dashKey = data.roomName || data.professionalName;
    if (!dashKey) {
      return;
    }

    // Filter out null/undefined values to avoid overwriting existing data
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key as keyof IDashboard] = value;
      }
      return acc;
    }, {} as IDashboard);

    result[dashKey] = {
      ...(result[dashKey] ?? {}),
      ...filteredData,
    };
  });

  return result;
};


const cleanEventMap = (
  data: Record<string, IDashboard> = {},
): Record<string, IDashboard> => {
  const result: Record<string, IDashboard> = { ...data };

  Object.keys(result).forEach(key => {
    result[key] = {
      ...result[key],
      calendarSummary: undefined,
    };
  });

  return result;
};

const cleanCardMap = (
  data: Record<string, IDashboard> = {},
): Record<string, IDashboard> => {
  const result: Record<string, IDashboard> = { ...data };

  Object.keys(result).forEach(key => {
    result[key] = {
      ...result[key],
      chartSummaries: undefined,
      miniCardSummaries: undefined,
      thisMonthTotal: undefined,
    };
  });

  return result;
};

const monthSummaryMap = (summaries: IMonthlyRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    summarySale: summary.saleSummary,
    summaryExpenses: summary.expenseSummary,
    summaryCashSale: summary.cashSaleSummary,
  });
  return map;
}, new Map<ISummaryRoom, {
  summarySale: IMonthlySummarySale[];
  summaryExpenses: IMonthlySummaryExpense[];
  summaryCashSale: IMonthlySummarySale[];
}>());

const yearExportMap = (summaries: IYearRoomExport[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    monthlyExport: summary.monthExport,
  });
  return map;
}, new Map<ISummaryRoom, {
  monthlyExport: IMonthlyExport[];
}>());

const emptySummaryTotal = (type: string): ISummaryTotal => ({ type, net: 0, btw: 0, gross: 0 } as ISummaryTotal);

const emptySummariesTotal = (): ISummaryTotal[] => [emptySummaryTotal('INCOME'), emptySummaryTotal('EXPENSE'),
  emptySummaryTotal('CASH')];

const emptyQuarterMonth = (month: number) => new MonthSummary(month, emptySummariesTotal());

const totalTypes = (quarterSummary: IMonthSummary) => ['INCOME', 'CASH', 'EXPENSE'].flatMap(type => {
  const matchingTotals = quarterSummary.total.filter(total => total.type === type);
  return matchingTotals.length ? matchingTotals : [emptySummaryTotal(type)];
});

const fullYear = (quarterSummaries: IQuarterSummary[]): IQuarterSummary[] => [1, 2, 3, 4].map(quarter => {
  const quarterSummary = quarterSummaries.find(year => year.quarter === quarter);
  if (quarterSummary) {
    const monthSummaries = [1, 2, 3].map(key => {
      const monthSummary = quarterSummary.monthSummaries.find(quarterS => quarterS.month === getMonth(quarter, key));
      if (monthSummary) {
        return new MonthSummary(monthSummary.month, totalTypes(monthSummary));
      }
      return emptyQuarterMonth(getMonth(quarter, key));
    });
    return new QuarterSummary(quarterSummary.quarter, monthSummaries);
  }
  const summaries = [1, 2, 3].map(key => emptyQuarterMonth(getMonth(quarter, key)));
  return new QuarterSummary(quarter, summaries);
});

const fullQuarter = (monthSummaries: IMonthSummary[], quarter: number): IMonthSummary[] => [1, 2, 3].map(key => {
  const monthSummary = monthSummaries.find(quarterS => quarterS.month === getMonth(quarter, key));
  if (monthSummary) {
    return new MonthSummary(monthSummary.month, totalTypes(monthSummary));
  }
  return emptyQuarterMonth(getMonth(quarter, key));
});

const yearSummaryMap = (summaries: IYearRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    quarterSummaries: fullYear(summary.quarterSummaries),
  });
  return map;
}, new Map<ISummaryRoom, { quarterSummaries: IQuarterSummary[] }>());

const quarterSummaryMap = (summaries: IQuarterRoomSummary[]) => summaries.reduce((map, summary) => {
  map.set({
    roomId: summary.roomId,
    roomName: summary.roomName,
    currency: summary.currency,
    timeZone: summary.timeZone,
    primary: summary.primary,
  }, {
    monthSummaries: fullQuarter(summary.monthSummaries, summary.quarter),
  });
  return map;
}, new Map<ISummaryRoom, { monthSummaries: IMonthSummary[] }>());
