/* eslint-disable camelcase */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { OverviewComponent } from '../user/overview/overview.component';
import {
  cleanReservation,
  getUpcomingReservation,
  setMeReservationParams,
} from '../store/actions/reservation.actions';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { MeReservationCreatePageComponent } from './reservation/me/me-reservation-create-page.component';
import { MeReservationDetailsPageComponent } from './reservation/me/me-reservation-details-page.component';
import { OptionComponent } from './payment/option/option.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { ReservationListComponent } from './reservation/list/reservation-list.component';
import { MeNavigationEffects } from './me-navigation.effects';

describe('MeNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: MeNavigationEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        MeNavigationEffects,
        provideMockActions(() => actions$),
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

  it('should restore reservation params on the me reservation create page', async () => {
    const date = new Date('2026-06-01T10:00:00Z');
    history.replaceState({
      treatmentId: 'treat-1',
      roomId: 'room-1',
      professionalId: 'pro-1',
      date,
      discountId: 'discount-1',
    }, '', '/...');

    actions$.next(routerNavigated(MeReservationCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadReservationCreatePage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      setMeReservationParams({
        treatmentId: 'treat-1',
        roomId: 'room-1',
        professionalId: 'pro-1',
        date,
        discountId: 'discount-1',
      }),
      getUpcomingReservation(),
    ]);
  });

  it('should load me reservation detail mode when an id is present', async () => {
    actions$.next(routerNavigated(MeReservationDetailsPageComponent, { id: 'res-1' }));

    const result = await firstValueFrom(
      effects.loadReservationDetailsPage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
      getUpcomingReservation(),
    ]);
  });

  it('should load me payment option page dependencies', async () => {
    actions$.next(routerNavigated(OptionComponent, { id: 'res-1' }));

    const result = await firstValueFrom(
      effects.loadPaymentOptionPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([
      cleanReservation(),
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
});
