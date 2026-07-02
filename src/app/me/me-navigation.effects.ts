import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { OverviewComponent } from '../user/overview/overview.component';
import {
  cleanReservation,
  getUpcomingReservation,
  setMeReservationParams,
} from '../store/actions/reservation.actions';
import { navigation } from '../util/router-navigation.operator';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { MeReservationCreatePageComponent } from './reservation/me/me-reservation-create-page.component';
import { MeReservationDetailsPageComponent } from './reservation/me/me-reservation-details-page.component';
import { OptionComponent } from './payment/option/option.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { ReservationListComponent } from './reservation/list/reservation-list.component';

@Injectable()
export class MeNavigationEffects {
  private readonly actions$: Actions = inject(Actions);

  loadDiscountsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MeDiscountComponent, {
        run: () => [],
      }),
    ));

  loadReferralsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ReferralsComponent, {
        run: () => [],
      }),
    ));

  loadPaymentOptionPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(OptionComponent, {
        run: () => [cleanReservation()],
      }),
    ));

  loadReservationCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MeReservationCreatePageComponent, {
        run: () => {
          const navigationState = history.state;
          const actions: Action[] = [cleanReservation()];

          if (this.hasReservationParams(navigationState)) {
            actions.push(
              setMeReservationParams({
                treatmentId: navigationState['treatmentId'],
                roomId: navigationState['roomId'],
                professionalId: navigationState['professionalId'],
                date: navigationState['date'],
                discountId: navigationState['discountId'],
              }),
            );
          }

          actions.push(getUpcomingReservation());
          return actions;
        },
      }),
    ));

  loadReservationDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MeReservationDetailsPageComponent, {
        run: () => [cleanReservation(), getUpcomingReservation()],
      }),
    ));

  loadReservationsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ReservationListComponent, {
        run: () => [cleanReservation()],
      }),
    ));

  loadOverviewPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(OverviewComponent, {
        run: () => [],
      }),
    ));

  private hasReservationParams(navigationState: Record<string, unknown> | undefined): navigationState is {
    treatmentId?: string;
    roomId?: string;
    professionalId?: string;
    date?: Date;
    discountId?: string;
  } {
    if (!navigationState) {
      return false;
    }

    return navigationState['treatmentId'] !== undefined
      || navigationState['roomId'] !== undefined
      || navigationState['professionalId'] !== undefined
      || navigationState['date'] !== undefined
      || navigationState['discountId'] !== undefined;
  }
}
