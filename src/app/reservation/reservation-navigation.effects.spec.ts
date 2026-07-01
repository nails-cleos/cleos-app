import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { getOptions } from '../store/actions/payment.actions';
import {
  cleanReservation,
  setDetailReservationParams,
  setReservationParams,
} from '../store/actions/reservation.actions';
import { CalendarComponent } from './calendar/calendar.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { ReservationNavigationEffects } from './reservation-navigation.effects';
import { ReservationCreatePageComponent } from './reservation-create-page.component';
import { ReservationEditPageComponent } from './reservation-edit-page.component';

describe('ReservationNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: ReservationNavigationEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        ReservationNavigationEffects,
        provideMockActions(() => actions$),
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
      effects.loadCalendarPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanReservation()]);
  });

  it('should clean reservation and load payment options for reservation complete route', async () => {
    history.replaceState({ isDashboard: true }, '', '/...');

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
    history.replaceState({
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
    }, '', '/...');

    actions$.next(routerNavigated(ReservationCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadReservationCreatePage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
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
    history.replaceState({ step: 3 }, '', '/...');

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
    history.replaceState({
      customerId: 'customer-1',
      isDashboard: true,
      treatmentId: 'treatment-1',
      groupId: 'group-1',
      roomId: 'room-1',
      professionalId: 'professional-1',
      skip: true,
      date,
      additionalIds: ['add-1'],
    }, '', '/...');

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
