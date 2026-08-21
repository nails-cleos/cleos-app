import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ReservationStore } from './reservation.store';
import { ReservationService } from '../services/reservation.service';
import { NavigationService } from '../services/navigation.service';
import { DashboardStore } from './dashboard.store';

describe('ReservationStore', () => {
  let store: InstanceType<typeof ReservationStore>;

  let serviceSpy: {
    loadPage: Mock;
    loadAllFiltered: Mock;
    loadUpcoming: Mock;
    loadAllByCustomer: Mock;
    loadAllByRoom: Mock;
    loadCalendar: Mock;
    customerSearch: Mock;
    getReservation: Mock;
    loadHistory: Mock;
    createReservation: Mock;
    updateReservationById: Mock;
    changeState: Mock;
    deleteReservation: Mock;
    createReview: Mock;
    getReview: Mock;
    updateReservationNote: Mock;
    updateReservationDiscount: Mock;
    updateReservationTimestamp: Mock;
    updateReservationColor: Mock;
    updateReservationCustomer: Mock;
  };

  let navigationSpy: {
    navigate: Mock;
  };

  let dashboardSpy: {
    getMyEvent: Mock;
  };
  let translateSpy: {
    instant: Mock;
  };

  beforeEach(() => {
    serviceSpy = {
      loadPage: vi.fn().mockName('ReservationService.loadPage'),
      loadAllFiltered: vi.fn().mockName('ReservationService.loadAllFiltered'),
      loadUpcoming: vi.fn().mockName('ReservationService.loadUpcoming'),
      loadAllByCustomer: vi
        .fn()
        .mockName('ReservationService.loadAllByCustomer'),
      loadAllByRoom: vi.fn().mockName('ReservationService.loadAllByRoom'),
      loadCalendar: vi.fn().mockName('ReservationService.loadCalendar'),
      customerSearch: vi.fn().mockName('ReservationService.customerSearch'),
      getReservation: vi.fn().mockName('ReservationService.getReservation'),
      loadHistory: vi.fn().mockName('ReservationService.loadHistory'),
      createReservation: vi
        .fn()
        .mockName('ReservationService.createReservation'),
      updateReservationById: vi
        .fn()
        .mockName('ReservationService.updateReservationById'),
      changeState: vi.fn().mockName('ReservationService.changeState'),
      deleteReservation: vi
        .fn()
        .mockName('ReservationService.deleteReservation'),
      createReview: vi.fn().mockName('ReservationService.createReview'),
      getReview: vi.fn().mockName('ReservationService.getReview'),
      updateReservationNote: vi
        .fn()
        .mockName('ReservationService.updateReservationNote'),
      updateReservationDiscount: vi
        .fn()
        .mockName('ReservationService.updateReservationDiscount'),
      updateReservationTimestamp: vi
        .fn()
        .mockName('ReservationService.updateReservationTimestamp'),
      updateReservationColor: vi
        .fn()
        .mockName('ReservationService.updateReservationColor'),
      updateReservationCustomer: vi
        .fn()
        .mockName('ReservationService.updateReservationCustomer'),
    };

    navigationSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
    };

    dashboardSpy = {
      getMyEvent: vi.fn().mockName('DashboardStore.getMyEvent'),
    };

    translateSpy = {
      instant: vi.fn().mockName('TranslateService.instant'),
    };
    translateSpy.instant.mockImplementation((k: string) => k);

    TestBed.configureTestingModule({
      providers: [
        ReservationStore,
        { provide: ReservationService, useValue: serviceSpy },
        { provide: NavigationService, useValue: navigationSpy },
        { provide: DashboardStore, useValue: dashboardSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(ReservationStore);
  });

  it('should load page', () => {
    serviceSpy.loadPage.mockReturnValue(of({} as any));

    store.loadPage({ page: 0, sort: 'id', direction: 'asc', size: 10 });

    expect(serviceSpy.loadPage).toHaveBeenCalled();
    expect(store.data()).toBeDefined();
  });

  it('should load availability', () => {
    serviceSpy.customerSearch.mockReturnValue(of([] as any));

    store.loadAvailability('r1', 't1', new Date(), 'p1');

    expect(store.availability()).toEqual([]);
  });

  it('should load calendar', () => {
    serviceSpy.loadCalendar.mockReturnValue(of([] as any));

    store.loadCalendar('r1', 7, [new Date()]);

    expect(store.calendar()).toEqual([]);
  });

  it('should load history', () => {
    serviceSpy.loadHistory.mockReturnValue(of([{ id: 'h1' }] as any));

    store.loadHistory('r1');

    expect(store.data()?.kind).toBe('list');
  });

  it('should load reservation and navigate when no payment link', () => {
    serviceSpy.getReservation.mockReturnValue(of({ id: 'r1' } as any));

    store.loadById('r1');

    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should open payment link when present', () => {
    vi.spyOn(window, 'open').mockReturnValue(undefined as any);

    serviceSpy.getReservation.mockReturnValue(
      of({ id: 'r1', paymentLink: 'http://pay' } as any),
    );

    store.loadById('r1');

    expect(window.open).toHaveBeenCalledWith('http://pay', '_self');
  });

  it('should create reservation and navigate per role', () => {
    serviceSpy.createReservation.mockReturnValue(
      of([{ id: 'r1', timestamp: 1, timeZone: 'UTC' }] as any),
    );

    store.create({} as any, 'customer' as any);

    expect(serviceSpy.createReservation).toHaveBeenCalled();
    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should update reservation', () => {
    serviceSpy.updateReservationById.mockReturnValue(
      of({ id: 'r1', timestamp: 1 } as any),
    );

    store.updateById('r1', {} as any, 'professional' as any);

    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should approve reservation via changeState', () => {
    serviceSpy.changeState.mockReturnValue(of({ paymentLink: null } as any));

    store.approve('r1');

    expect(serviceSpy.changeState).toHaveBeenCalled();
  });

  it('should handle payment link in state change', () => {
    vi.spyOn(window, 'open').mockReturnValue(undefined as any);

    serviceSpy.changeState.mockReturnValue(
      of({ paymentLink: 'http://pay' } as any),
    );

    store.complete('r1');

    expect(window.open).toHaveBeenCalled();
  });

  it('should delete reservation', () => {
    serviceSpy.deleteReservation.mockReturnValue(of(void 0));

    store.delete('r1', '1700', 'UTC');

    expect(navigationSpy.navigate).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should create review', () => {
    serviceSpy.createReview.mockReturnValue(of({ id: 'r1' } as any));

    store.createReview({} as any);

    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should load review', () => {
    serviceSpy.getReview.mockReturnValue(of({ id: 'rev1' } as any));

    store.loadReview('r1');

    expect(store.review()).toEqual({ id: 'rev1' } as any);
  });

  it('should handle error from loadPage', () => {
    serviceSpy.loadPage.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'ERROR' },
          }),
      ),
    );

    store.loadPage({ page: 0, sort: 'id', direction: 'asc', size: 10 });

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );
  });

  it('should clean store', () => {
    serviceSpy.loadPage.mockReturnValue(of({} as any));

    store.loadPage({ page: 0, sort: 'id', direction: 'asc', size: 10 });

    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
    expect(store.error()).toBeUndefined();
  });
});
