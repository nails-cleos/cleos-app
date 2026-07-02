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
import { setPaymentResultParams } from '../store/actions/payment.actions';
import { getRouteParams } from '../util/router-state.utils';
import { navigation } from '../util/router-navigation.operator';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { MeReservationCreatePageComponent } from './reservation/me/me-reservation-create-page.component';
import { MeReservationDetailsPageComponent } from './reservation/me/me-reservation-details-page.component';
import { PaymentCompleteComponent } from './payment/complete/payment-complete.component';
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

  loadPaymentCompletePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(PaymentCompleteComponent, {
        run: ({ payload }, routerState) => {
          const params = getRouteParams(routerState);
          const queryParams = payload.routerState.root.queryParams;
          const path = params['path'];

          if (path !== 'reservation' && path !== 'transaction') {
            return [];
          }

          return [
            setPaymentResultParams({
              path,
              id: params['id'],
              status: params['status'],
              paymentId: queryParams?.['payment_id'] ?? queryParams?.['paymentId'],
              preferenceId: queryParams?.['preference_id'],
              payerId: queryParams?.['PayerID'],
              token: queryParams?.['token'],
              reason: queryParams?.['reason'] ?? queryParams?.['errorcode'],
              orderId: queryParams?.['order_id'] ?? queryParams?.['orderId'],
              orderStatusId: queryParams?.['orderStatusId'],
              paymentType: queryParams?.['payment_type'],
              accountId: queryParams?.['account_id'],
            }),
          ];
        },
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
