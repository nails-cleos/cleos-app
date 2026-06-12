/* eslint-disable camelcase */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { RouterNavigatedAction, ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { OverviewComponent } from '../user/overview/overview.component';
import { cleanPayment, getOptions, setPaymentResultParams } from '../store/actions/payment.actions';
import {
  cleanReservation,
  getAllRooms,
  getUpcomingReservation,
  setMeReservationParams,
} from '../store/actions/reservation.actions';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { MeReservationCreatePageComponent } from './reservation/me/me-reservation-create-page.component';
import { MeReservationDetailsPageComponent } from './reservation/me/me-reservation-details-page.component';
import { PaymentCompleteComponent } from './payment/complete/payment-complete.component';
import { MePaymentComponent } from './payment/me/me-payment.component';
import { OptionComponent } from './payment/option/option.component';
import { PaymentComponent } from './payment/payment.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { ReservationListComponent } from './reservation/list/reservation-list.component';
import { MeNavigationEffects } from './me-navigation.effects';

describe('MeNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: MeNavigationEffects;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    routerSpy = jasmine.createSpyObj('Router', ['currentNavigation']);
    routerSpy.currentNavigation.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        MeNavigationEffects,
        provideMockActions(() => actions$),
        { provide: Router, useValue: routerSpy },
      ],
    });

    effects = TestBed.inject(MeNavigationEffects);
  });

  const routerNavigated = (
    activeComponent: unknown,
    params: Record<string, string> = {},
    queryParams: Record<string, string> = {},
  ): RouterNavigatedAction<any> =>
    ({
      type: ROUTER_NAVIGATED,
      payload: {
        event: {} as any,
        routerState: {
          activeComponent,
          root: { queryParams, params, firstChild: undefined },
        } as any,
      },
    }) as RouterNavigatedAction<any>;

  it('should clean and load referrals on the referrals page', async () => {
    actions$.next(routerNavigated(ReferralsComponent));

    const result = await firstValueFrom(
      effects.loadReferralsPage$.pipe(take(0), toArray()),
    );

    expect(result).toEqual([]);
  });

  it('should clean payments on the me resource payment page', async () => {
    actions$.next(routerNavigated(PaymentComponent, { path: 'reservation', id: 'res-1' }));

    const result = await firstValueFrom(
      effects.loadPaymentPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanPayment()]);
  });

  it('should prepare payment result params on the payment completion page', async () => {
    actions$.next(routerNavigated(
      PaymentCompleteComponent,
      { path: 'reservation', id: 'res-1', status: 'success' },
      { payment_id: 'pay-1', preference_id: 'pref-1', reason: 'declined', account_id: 'acc-1' },
    ));

    const result = await firstValueFrom(
      effects.loadPaymentCompletePage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([
      cleanPayment(),
      setPaymentResultParams({
        path: 'reservation',
        id: 'res-1',
        status: 'success',
        paymentId: 'pay-1',
        preferenceId: 'pref-1',
        payerId: undefined,
        token: undefined,
        reason: 'declined',
        orderId: undefined,
        orderStatusId: undefined,
        paymentType: undefined,
        accountId: 'acc-1',
      }),
    ]);
  });

  it('should restore reservation params on the me reservation create page', async () => {
    const date = new Date('2026-06-01T10:00:00Z');
    routerSpy.currentNavigation.and.returnValue({
      extras: {
        state: {
          treatmentId: 'treat-1',
          roomId: 'room-1',
          professionalId: 'pro-1',
          date,
          discountId: 'discount-1',
        },
      },
    } as any);

    actions$.next(routerNavigated(MeReservationCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadReservationCreatePage$.pipe(take(5), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getOptions(),
      setMeReservationParams({
        treatmentId: 'treat-1',
        roomId: 'room-1',
        professionalId: 'pro-1',
        date,
        discountId: 'discount-1',
      }),
      getAllRooms({}),
      getUpcomingReservation(),
    ]);
  });

  it('should load me reservation detail mode when an id is present', async () => {
    actions$.next(routerNavigated(MeReservationDetailsPageComponent, { id: 'res-1' }));

    const result = await firstValueFrom(
      effects.loadReservationDetailsPage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getOptions(),
      getUpcomingReservation(),
    ]);
  });

  it('should load me payment option page dependencies', async () => {
    actions$.next(routerNavigated(OptionComponent, { id: 'res-1' }));

    const result = await firstValueFrom(
      effects.loadPaymentOptionPage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanPayment(),
      cleanReservation(),
      getOptions(),
    ]);
  });

  it('should clean reservation on the reservation list page', async () => {
    actions$.next(routerNavigated(ReservationListComponent));

    const result = await firstValueFrom(
      effects.loadReservationsPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanReservation()]);
  });

  it('should not dispatch store actions on the overview page', async () => {
    actions$.next(routerNavigated(OverviewComponent));

    const result = await firstValueFrom(
      effects.loadOverviewPage$.pipe(take(0), toArray()),
    );

    expect(result).toEqual([]);
  });

  it('should clean discounts on the discounts page', async () => {
    actions$.next(routerNavigated(MeDiscountComponent));

    const result = await firstValueFrom(
      effects.loadDiscountsPage$.pipe(take(0), toArray()),
    );

    expect(result).toEqual([]);
  });

  it('should load options for the direct me payment page', async () => {
    actions$.next(routerNavigated(MePaymentComponent, { id: 'payment-1' }));

    const result = await firstValueFrom(
      effects.loadDirectPaymentPage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([cleanPayment(), getOptions()]);
  });
});
