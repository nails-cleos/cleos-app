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

  let serviceSpy: jasmine.SpyObj<ReservationService>;
  let navigationSpy: jasmine.SpyObj<NavigationService>;
  let dashboardSpy: jasmine.SpyObj<typeof DashboardStore>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj<ReservationService>('ReservationService', [
      'loadPage',
      'loadAllFiltered',
      'loadUpcoming',
      'loadAllByCustomer',
      'loadAllByRoom',
      'loadCalendar',
      'customerSearch',
      'getReservation',
      'loadHistory',
      'createReservation',
      'updateReservationById',
      'changeState',
      'deleteReservation',
      'createReview',
      'getReview',
      'updateReservationNote',
      'updateReservationDiscount',
      'updateReservationTimestamp',
      'updateReservationColor',
      'updateReservationCustomer',
    ]);

    navigationSpy = jasmine.createSpyObj<NavigationService>('NavigationService', [
      'navigate',
    ]);

    dashboardSpy = jasmine.createSpyObj('DashboardStore', [
      'getMyEvent',
    ]);

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((k: string) => k);

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
    serviceSpy.loadPage.and.returnValue(of({} as any));

    store.loadPage({ page: 0, sort: 'id', direction: 'asc', size: 10 });

    expect(serviceSpy.loadPage).toHaveBeenCalled();
    expect(store.data()).toBeDefined();
  });

  it('should load availability', () => {
    serviceSpy.customerSearch.and.returnValue(of([] as any));

    store.loadAvailability('r1', 't1', new Date(), 'p1');

    expect(store.availability()).toEqual([]);
  });

  it('should load calendar', () => {
    serviceSpy.loadCalendar.and.returnValue(of([] as any));

    store.loadCalendar('r1', 7, [new Date()]);

    expect(store.calendar()).toEqual([]);
  });

  it('should load history', () => {
    serviceSpy.loadHistory.and.returnValue(of([{ id: 'h1' }] as any));

    store.loadHistory('r1');

    expect(store.data()?.kind).toBe('list');
  });

  it('should load reservation and navigate when no payment link', () => {
    serviceSpy.getReservation.and.returnValue(of({ id: 'r1' } as any));

    store.loadById('r1');

    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should open payment link when present', () => {
    spyOn(window, 'open');

    serviceSpy.getReservation.and.returnValue(
      of({ id: 'r1', paymentLink: 'http://pay' } as any),
    );

    store.loadById('r1');

    expect(window.open).toHaveBeenCalledWith('http://pay', '_self');
  });

  it('should create reservation and navigate per role', () => {
    serviceSpy.createReservation.and.returnValue(
      of([{ id: 'r1', timestamp: 1, timeZone: 'UTC' }] as any),
    );

    store.create({} as any, 'customer' as any);

    expect(serviceSpy.createReservation).toHaveBeenCalled();
    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should update reservation', () => {
    serviceSpy.updateReservationById.and.returnValue(
      of({ id: 'r1', timestamp: 1 } as any),
    );

    store.updateById('r1', {} as any, 'professional' as any);

    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should approve reservation via changeState', () => {
    serviceSpy.changeState.and.returnValue(
      of({ paymentLink: null } as any),
    );

    store.approve('r1');

    expect(serviceSpy.changeState).toHaveBeenCalled();
  });

  it('should handle payment link in state change', () => {
    spyOn(window, 'open');

    serviceSpy.changeState.and.returnValue(
      of({ paymentLink: 'http://pay' } as any),
    );

    store.complete('r1');

    expect(window.open).toHaveBeenCalled();
  });

  it('should delete reservation', () => {
    serviceSpy.deleteReservation.and.returnValue(of(void 0));

    store.delete('r1', '1700', 'UTC');

    expect(navigationSpy.navigate).toHaveBeenCalledWith(
      jasmine.any(Array),
    );
  });

  it('should create review', () => {
    serviceSpy.createReview.and.returnValue(of({ id: 'r1' } as any));

    store.createReview({} as any);

    expect(navigationSpy.navigate).toHaveBeenCalled();
  });

  it('should load review', () => {
    serviceSpy.getReview.and.returnValue(of({ id: 'rev1' } as any));

    store.loadReview('r1');

    expect(store.review()).toEqual({ id: 'rev1' } as any);
  });

  it('should handle error from loadPage', () => {
    serviceSpy.loadPage.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 500,
          error: { message: 'ERROR' },
        }),
      ),
    );

    store.loadPage({ page: 0, sort: 'id', direction: 'asc', size: 10 });

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );
  });

  it('should clean store', () => {
    serviceSpy.loadPage.and.returnValue(of({} as any));

    store.loadPage({ page: 0, sort: 'id', direction: 'asc', size: 10 });

    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
    expect(store.error()).toBeUndefined();
  });
});
