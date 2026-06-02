import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { OverviewComponent } from '../user/overview/overview.component';
import {
  cleanReservation,
  getAllRooms,
  getUpcomingReservation,
  setMeReservationParams,
} from '../store/actions/reservation.actions';
import {
  cleanPayment,
  getOptions,
  setPaymentResultParams,
} from '../store/actions/payment.actions';
import { getRouteParams } from '../util/router-state.utils';
import { cleanUser } from '../store/actions/user.actions';
import { navigation } from '../util/router-navigation.operator';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { MeReservationCreatePageComponent } from './me-reservation-create-page.component';
import { MeReservationDetailsPageComponent } from './me-reservation-details-page.component';
import { PaymentCompleteComponent } from './payment/complete/payment-complete.component';
import { MePaymentComponent } from './payment/me/me-payment.component';
import { OptionComponent } from './payment/option/option.component';
import { PaymentComponent } from './payment/payment.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { ReservationListComponent } from './reservation/list/reservation-list.component';

@Injectable()
export class MeNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

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

  loadPaymentPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(PaymentComponent, {
        run: () => cleanPayment(),
      }),
    ));

  loadDirectPaymentPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MePaymentComponent, {
        run: () => [cleanPayment(), getOptions()],
      }),
    ));

  loadPaymentOptionPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(OptionComponent, {
        run: () => [cleanPayment(), cleanReservation(), getOptions()],
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
            cleanPayment(),
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
          const navigationState = this.router.currentNavigation()?.extras.state;
          const actions: Action[] = [cleanReservation(), getOptions()];

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

          actions.push(getAllRooms({}), getUpcomingReservation());
          return actions;
        },
      }),
    ));

  loadReservationDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MeReservationDetailsPageComponent, {
        run: () => [cleanReservation(), getOptions(), getUpcomingReservation()],
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
        run: () => [cleanUser()],
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
