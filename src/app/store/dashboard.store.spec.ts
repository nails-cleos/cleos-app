import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { DashboardStore } from './dashboard.store';
import { DashboardService } from '../services/dashboard.service';
import { NavigationService } from '../services/navigation.service';
import { backendFormatDate } from '@app/util/dates';

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;

  let dashboardService: {
    getEvents: Mock;
    getCards: Mock;
    getMyEvent: Mock;
    updateEvent: Mock;
    getMonthlySummary: Mock;
    updateMonthlySummary: Mock;
    getYearSummary: Mock;
    exportYearSummary: Mock;
    getQuarterSummary: Mock;
  };

  let navigationService: {
    reload: Mock;
  };

  let router: {
    url: '/dashboard/month/summary';
  };

  beforeEach(() => {
    dashboardService = {
      getEvents: vi.fn().mockName('DashboardService.getEvents'),
      getCards: vi.fn().mockName('DashboardService.getCards'),
      getMyEvent: vi.fn().mockName('DashboardService.getMyEvent'),
      updateEvent: vi.fn().mockName('DashboardService.updateEvent'),
      getMonthlySummary: vi.fn().mockName('DashboardService.getMonthlySummary'),
      updateMonthlySummary: vi
        .fn()
        .mockName('DashboardService.updateMonthlySummary'),
      getYearSummary: vi.fn().mockName('DashboardService.getYearSummary'),
      exportYearSummary: vi.fn().mockName('DashboardService.exportYearSummary'),
      getQuarterSummary: vi.fn().mockName('DashboardService.getQuarterSummary'),
    };

    navigationService = {
      reload: vi.fn().mockName('NavigationService.reload'),
    };

    router = {
      url: '/dashboard/month/summary',
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        {
          provide: DashboardService,
          useValue: dashboardService,
        },
        {
          provide: NavigationService,
          useValue: navigationService,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    store = TestBed.inject(DashboardStore);
  });

  describe('clearResponse', () => {
    it('should clear response', () => {
      dashboardService.updateMonthlySummary.mockReturnValue(of(void 0));

      store.updateMonthlySummary('2025-01', 'INCOME', [], [], undefined, 1);

      expect(store.response()).toEqual({
        message: 'SUMMARY.UPDATED',
      });

      store.clearResponse();

      expect(store.response()).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      dashboardService.getEvents.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
            }),
        ),
      );

      store.getEvents(backendFormatDate(new Date()));

      expect(store.error()).toBeTruthy();

      store.clearError();

      expect(store.error()).toBeUndefined();
      expect(store.subErrors()).toBeUndefined();
    });
  });

  describe('getEvents', () => {
    it('should load events', () => {
      dashboardService.getEvents.mockReturnValue(
        of([
          {
            roomName: 'Room A',
            calendarSummary: [],
          },
        ] as any),
      );

      store.getEvents(backendFormatDate(new Date()));

      expect(dashboardService.getEvents).toHaveBeenCalled();

      expect(store.isLoading()).toBe(false);

      expect(store.data()?.['Room A']).toEqual(
        expect.objectContaining({
          roomName: 'Room A',
        }),
      );
    });

    it('should handle errors', () => {
      dashboardService.getEvents.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
            }),
        ),
      );

      store.getEvents(backendFormatDate(new Date()));

      expect(store.error()).toBeTruthy();
    });
  });

  describe('getCards', () => {
    it('should load cards', () => {
      dashboardService.getCards.mockReturnValue(
        of([
          {
            roomName: 'Room A',
            chartSummaries: [],
          },
        ] as any),
      );

      store.getCards(backendFormatDate(new Date()));

      expect(dashboardService.getCards).toHaveBeenCalled();

      expect(store.isLoading()).toBe(false);

      expect(store.data()?.['Room A']).toEqual(
        expect.objectContaining({
          roomName: 'Room A',
        }),
      );
    });
  });

  describe('getMyEvent', () => {
    it('should load dashboard', () => {
      const dashboard = {
        reservations: [],
      };

      dashboardService.getMyEvent.mockReturnValue(of(dashboard as any));

      store.getMyEvent(backendFormatDate(new Date()));

      expect(store.dashboard()).toEqual(dashboard as any);
    });
  });

  describe('updateEvent', () => {
    it('should update event', () => {
      dashboardService.updateEvent.mockReturnValue(of(void 0));

      store.updateEvent('reservation-1', {} as any);

      expect(dashboardService.updateEvent).toHaveBeenCalledWith(
        'reservation-1',
        expect.any(Object),
      );

      expect(store.isLoading()).toBe(false);
    });
  });

  describe('getMonthlySummary', () => {
    it('should load monthly summary', () => {
      dashboardService.getMonthlySummary.mockReturnValue(
        of([
          {
            roomId: '1',
            roomName: 'Room A',
            currency: 'EUR',
            timeZone: 'UTC',
            primary: true,
            saleSummary: [],
            expenseSummary: [],
            cashSaleSummary: [],
          },
        ] as any),
      );

      store.getMonthlySummary('2025-01');

      expect(store.monthlySummaryMap()).toBeTruthy();

      expect(store.isLoading()).toBe(false);
    });
  });

  describe('updateMonthlySummary', () => {
    it('should update summary and navigate', () => {
      dashboardService.updateMonthlySummary.mockReturnValue(of(void 0));

      store.updateMonthlySummary('2025-01', 'INCOME', [], [], 'room-1', 2);

      expect(dashboardService.updateMonthlySummary).toHaveBeenCalled();

      expect(store.response()).toEqual({
        message: 'SUMMARY.UPDATED',
      });

      expect(navigationService.reload).toHaveBeenCalled();
    });

    it('should handle update error', () => {
      dashboardService.updateMonthlySummary.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 500,
            }),
        ),
      );

      store.updateMonthlySummary('2025-01', 'INCOME', [], [], undefined, 1);

      expect(store.error()).toBeTruthy();
    });
  });

  describe('getYearSummary', () => {
    it('should load year summary', () => {
      dashboardService.getYearSummary.mockReturnValue(
        of([
          {
            roomId: '1',
            roomName: 'Room A',
            currency: 'EUR',
            timeZone: 'UTC',
            primary: true,
            quarterSummaries: [],
          },
        ] as any),
      );

      store.getYearSummary(2025);

      expect(dashboardService.getYearSummary).toHaveBeenCalledWith(2025);

      expect(store.yearSummaryMap()).toBeTruthy();
    });
  });

  describe('exportYearSummary', () => {
    it('should export year summary', () => {
      dashboardService.exportYearSummary.mockReturnValue(
        of([
          {
            roomId: '1',
            roomName: 'Room A',
            currency: 'EUR',
            timeZone: 'UTC',
            primary: true,
            monthExport: [],
          },
        ] as any),
      );

      store.exportYearSummary(2025);

      expect(dashboardService.exportYearSummary).toHaveBeenCalledWith(2025);

      expect(store.yearExport()).toBeTruthy();
    });
  });

  describe('getQuarterSummary', () => {
    it('should load quarter summary', () => {
      dashboardService.getQuarterSummary.mockReturnValue(
        of([
          {
            roomId: '1',
            roomName: 'Room A',
            currency: 'EUR',
            timeZone: 'UTC',
            primary: true,
            quarter: 1,
            monthSummaries: [],
          },
        ] as any),
      );

      store.getQuarterSummary(2025, 1);

      expect(dashboardService.getQuarterSummary).toHaveBeenCalledWith(2025, 1);

      expect(store.quarterSummaryMap()).toBeTruthy();
    });
  });

  describe('clean', () => {
    it('should reset state', () => {
      dashboardService.getMyEvent.mockReturnValue(
        of({
          reservations: [],
        } as any),
      );

      store.getMyEvent(backendFormatDate(new Date()));

      expect(store.dashboard()).toBeTruthy();

      store.clean();

      expect(store.dashboard()).toBeUndefined();
      expect(store.response()).toBeUndefined();
      expect(store.error()).toBeUndefined();
      expect(store.isLoading()).toBe(false);
    });
  });
});
