import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { DashboardStore } from './dashboard.store';
import { DashboardService } from '../services/dashboard.service';
import { NavigationService } from '../services/navigation.service';

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;

  let dashboardService: jasmine.SpyObj<DashboardService>;
  let navigationService: jasmine.SpyObj<NavigationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    dashboardService = jasmine.createSpyObj('DashboardService', [
      'getEvents',
      'getCards',
      'getMyEvent',
      'updateEvent',
      'getMonthlySummary',
      'updateMonthlySummary',
      'getYearSummary',
      'exportYearSummary',
      'getQuarterSummary',
    ]);

    navigationService = jasmine.createSpyObj(
      'NavigationService',
      ['reload'],
    );

    router = jasmine.createSpyObj(
      'Router',
      [],
      {
        url: '/dashboard/month/summary',
      },
    );

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
    });

    store = TestBed.inject(DashboardStore);
  });

  describe('clearResponse', () => {
    it('should clear response', () => {
      dashboardService.updateMonthlySummary.and.returnValue(
        of(void 0),
      );

      store.updateMonthlySummary(
        '2025-01',
        'INCOME',
        [],
        [],
        undefined,
        1,
      );

      expect(store.response()).toEqual({
        message: 'SUMMARY.UPDATED',
      });

      store.clearResponse();

      expect(store.response()).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      dashboardService.getEvents.and.returnValue(
        throwError(() =>
          new HttpErrorResponse({
            status: 500,
          }),
        ),
      );

      store.getEvents(new Date());

      expect(store.error()).toBeTruthy();

      store.clearError();

      expect(store.error()).toBeUndefined();
      expect(store.subErrors()).toBeUndefined();
    });
  });

  describe('getEvents', () => {
    it('should load events', () => {
      dashboardService.getEvents.and.returnValue(
        of([
          {
            roomName: 'Room A',
            calendarSummary: [],
          },
        ] as any),
      );

      store.getEvents(new Date());

      expect(dashboardService.getEvents).toHaveBeenCalled();

      expect(store.isLoading()).toBeFalse();

      expect(store.data()?.['Room A']).toEqual(
        jasmine.objectContaining({
          roomName: 'Room A',
        }),
      );
    });

    it('should handle errors', () => {
      dashboardService.getEvents.and.returnValue(
        throwError(() =>
          new HttpErrorResponse({
            status: 500,
          }),
        ),
      );

      store.getEvents(new Date());

      expect(store.error()).toBeTruthy();
    });
  });

  describe('getCards', () => {
    it('should load cards', () => {
      dashboardService.getCards.and.returnValue(
        of([
          {
            roomName: 'Room A',
            chartSummaries: [],
          },
        ] as any),
      );

      store.getCards(new Date());

      expect(dashboardService.getCards).toHaveBeenCalled();

      expect(store.isLoading()).toBeFalse();

      expect(store.data()?.['Room A']).toEqual(
        jasmine.objectContaining({
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

      dashboardService.getMyEvent.and.returnValue(
        of(dashboard as any),
      );

      store.getMyEvent(new Date());

      expect(store.dashboard()).toEqual(dashboard as any);
    });
  });

  describe('updateEvent', () => {
    it('should update event', () => {
      dashboardService.updateEvent.and.returnValue(
        of(void 0),
      );

      store.updateEvent(
        'reservation-1',
        {} as any,
      );

      expect(
        dashboardService.updateEvent,
      ).toHaveBeenCalledWith(
        'reservation-1',
        jasmine.any(Object),
      );

      expect(store.isLoading()).toBeFalse();
    });
  });

  describe('getMonthlySummary', () => {
    it('should load monthly summary', () => {
      dashboardService.getMonthlySummary.and.returnValue(
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

      expect(
        store.monthlySummaryMap(),
      ).toBeTruthy();

      expect(store.isLoading()).toBeFalse();
    });
  });

  describe('updateMonthlySummary', () => {
    it('should update summary and navigate', () => {
      dashboardService.updateMonthlySummary.and.returnValue(
        of(void 0),
      );

      store.updateMonthlySummary(
        '2025-01',
        'INCOME',
        [],
        [],
        'room-1',
        2,
      );

      expect(
        dashboardService.updateMonthlySummary,
      ).toHaveBeenCalled();

      expect(store.response()).toEqual({
        message: 'SUMMARY.UPDATED',
      });

      expect(
        navigationService.reload,
      ).toHaveBeenCalled();
    });

    it('should handle update error', () => {
      dashboardService.updateMonthlySummary.and.returnValue(
        throwError(() =>
          new HttpErrorResponse({
            status: 500,
          }),
        ),
      );

      store.updateMonthlySummary(
        '2025-01',
        'INCOME',
        [],
        [],
        undefined,
        1,
      );

      expect(store.error()).toBeTruthy();
    });
  });

  describe('getYearSummary', () => {
    it('should load year summary', () => {
      dashboardService.getYearSummary.and.returnValue(
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

      expect(
        dashboardService.getYearSummary,
      ).toHaveBeenCalledWith(2025);

      expect(
        store.yearSummaryMap(),
      ).toBeTruthy();
    });
  });

  describe('exportYearSummary', () => {
    it('should export year summary', () => {
      dashboardService.exportYearSummary.and.returnValue(
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

      expect(
        dashboardService.exportYearSummary,
      ).toHaveBeenCalledWith(2025);

      expect(
        store.yearExport(),
      ).toBeTruthy();
    });
  });

  describe('getQuarterSummary', () => {
    it('should load quarter summary', () => {
      dashboardService.getQuarterSummary.and.returnValue(
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

      store.getQuarterSummary(
        2025,
        1,
      );

      expect(
        dashboardService.getQuarterSummary,
      ).toHaveBeenCalledWith(
        2025,
        1,
      );

      expect(
        store.quarterSummaryMap(),
      ).toBeTruthy();
    });
  });

  describe('clean', () => {
    it('should reset state', () => {
      dashboardService.getMyEvent.and.returnValue(
        of({
          reservations: [],
        } as any),
      );

      store.getMyEvent(new Date());

      expect(store.dashboard()).toBeTruthy();

      store.clean();

      expect(store.dashboard()).toBeUndefined();
      expect(store.response()).toBeUndefined();
      expect(store.error()).toBeUndefined();
      expect(store.isLoading()).toBeFalse();
    });
  });
});
