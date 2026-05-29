import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { getOptions } from '../store/payment.actions';
import {
  cleanReservation,
  getAllRooms,
  getCustomers,
  setDetailReservationParams,
  setReservationParams,
} from '../store/reservation.actions';
import { ReservationNavigationEffects } from './reservation-navigation.effects';

describe('ReservationNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: ReservationNavigationEffects;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    routerSpy.currentNavigation.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        ReservationNavigationEffects,
        provideMockActions(() => actions$),
        { provide: Router, useValue: routerSpy },
      ],
    });

    effects = TestBed.inject(ReservationNavigationEffects);
  });

  const routerNavigation = (url: string): RouterNavigationAction =>
    ({
      type: ROUTER_NAVIGATION,
      payload: {
        event: {} as any,
        routerState: { url } as any,
      },
    }) as RouterNavigationAction;

  it('should clean reservation and load rooms for reservation calendar route', async () => {
    actions$.next(routerNavigation('/en-GB/reservation/calendar'));

    const result = await firstValueFrom(
      effects.handleReservationNavigation$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getAllRooms({}),
    ]);
  });

  it('should clean reservation and load payment options for reservation complete route', async () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          isDashboard: true,
        },
      },
    } as any);

    actions$.next(routerNavigation('/en-GB/reservation/res-1/rooms/room-1/customer/customer-1/complete'));

    const result = await firstValueFrom(
      effects.handleReservationNavigation$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getOptions(),
    ]);
  });

  it('should restore reservation params from navigation state on base reservation route', async () => {
    const date = new Date('2026-04-24T10:00:00Z');
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          isDashboard: true,
          skip: true,
          customerId: 'customer-1',
          treatmentId: 'treatment-1',
          groupId: 'group-1',
          roomId: 'room-1',
          professionalId: 'professional-1',
          additionalIds: ['add-1', 'add-2'],
          date,
          discountId: 'discount-1',
        },
      },
    } as any);

    actions$.next(routerNavigation('/en-GB/reservation'));

    const result = await firstValueFrom(
      effects.handleReservationNavigation$.pipe(take(4), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getCustomers(),
      getOptions(),
      setReservationParams({
        isDashboard: true,
        skip: true,
        customerId: 'customer-1',
        treatmentId: 'treatment-1',
        groupId: 'group-1',
        roomId: 'room-1',
        professionalId: 'professional-1',
        additionalIds: ['add-1', 'add-2'],
        date,
        discountId: 'discount-1',
      }),
    ]);
  });

  it('should set detail params step on reservation detail route', async () => {
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          step: 3,
        },
      },
    } as any);

    actions$.next(routerNavigation('/en-GB/reservation/res-2'));

    const result = await firstValueFrom(
      effects.handleReservationNavigation$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getOptions(),
      setDetailReservationParams({ step: 3 }),
    ]);
  });
});
