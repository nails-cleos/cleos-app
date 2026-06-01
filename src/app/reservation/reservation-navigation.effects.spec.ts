import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
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
import { CalendarComponent } from './calendar/calendar.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { ReservationNavigationEffects } from './reservation-navigation.effects';
import { ReservationCreatePageComponent } from './reservation-create-page.component';
import { ReservationEditPageComponent } from './reservation-edit-page.component';

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

  const routerNavigated = (
    activeComponent: unknown,
    params: Record<string, string> = {},
  ): RouterNavigatedAction<any> =>
    ({
      type: ROUTER_NAVIGATED,
      payload: {
        event: {} as any,
        routerState: {
          activeComponent,
          root: { params, firstChild: undefined, queryParams: {} },
        } as any,
      },
    }) as RouterNavigatedAction<any>;

  it('should clean reservation and load rooms for reservation calendar route', async () => {
    actions$.next(routerNavigated(CalendarComponent));

    const result = await firstValueFrom(
      effects.loadCalendarPage$.pipe(take(2), toArray()),
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

    actions$.next(routerNavigated(ReservationCompleteComponent, {
      id: 'res-1',
      roomId: 'room-1',
      customerId: 'customer-1',
    }));

    const result = await firstValueFrom(
      effects.loadCompletePage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getOptions(),
      setReservationParams({
        isDashboard: true,
      }),
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

    actions$.next(routerNavigated(ReservationCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadReservationCreatePage$.pipe(take(4), toArray()),
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

    actions$.next(routerNavigated(ReservationDetailComponent, { id: 'res-2' }));

    const result = await firstValueFrom(
      effects.loadReservationDetailsPage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getOptions(),
      setDetailReservationParams({ step: 3 }),
    ]);
  });

  it('should restore edit params on reservation editor route', async () => {
    const date = new Date('2026-04-24T10:00:00Z');
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          customerId: 'customer-1',
          isDashboard: true,
          treatmentId: 'treatment-1',
          groupId: 'group-1',
          roomId: 'room-1',
          professionalId: 'professional-1',
          skip: true,
          date,
          additionalIds: ['add-1'],
        },
      },
    } as any);

    actions$.next(routerNavigated(ReservationEditPageComponent, { id: 'res-2' }));

    const result = await firstValueFrom(
      effects.loadReservationEditPage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getOptions(),
      setReservationParams({
        customerId: 'customer-1',
        isDashboard: true,
        treatmentId: 'treatment-1',
        groupId: 'group-1',
        roomId: 'room-1',
        professionalId: 'professional-1',
        skip: true,
        date,
        additionalIds: ['add-1'],
        discountId: undefined,
      }),
    ]);
  });
});
