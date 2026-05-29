import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanDiscount, getMyReferrals } from '../store/discount.actions';
import {
  cleanReservation,
  getAllRooms,
  getUpcomingReservation,
  setMeReservationParams,
} from '../store/reservation.actions';
import { Router } from '@angular/router';
import {
  cleanPayment,
  getOptions,
  setPaymentResultParams,
} from '../store/payment.actions';
import { cleanUser } from '../store/user.actions';

@Injectable()
export class MeNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  handleMeNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const navigation = this.router.currentNavigation();
        const navigationState = navigation?.extras.state;

        // 1) /me/discounts
        const discountsMatch = url.match(/\/me\/discounts$/);
        if (discountsMatch) {
          return [cleanDiscount()];
        }

        // 2) /me/referrals
        const referralsMatch = url.match(/\/me\/referrals$/);
        if (referralsMatch) {
          return [cleanDiscount(), getMyReferrals()];
        }

        // 3) /me/:path/:id/payment?accountId=:accountId
        const pathMatch = url.match(/\/me\/([^/]+)\/([^/]+)\/payment(?:\?.*)?$/);
        if (pathMatch) {
          const [, path] = pathMatch;
          if (path === 'reservation' || path === 'transaction') {
            return [cleanPayment()];
          }
        }

        // 4) /me/payment/:id
        const paymentIdMatch = url.match(/\/me\/payment\/([^\/]+)$/);
        if (paymentIdMatch) {
          return [cleanPayment(), getOptions()];
        }

        // 5) /me/reservation/:id/payment/option
        const paymentReservationIdMatch = url.match(/\/me\/reservation\/([^\/]+)\/payment\/option$/);
        if (paymentReservationIdMatch) {
          return [
            cleanPayment(),
            cleanReservation(),
            getOptions(),
          ];
        }

        // 6) /me/:path/:id/payment/:status
        const match = url.match(/\/me\/([^/]+)\/([^/]+)\/payment\/([^/?]+)/);
        if (match) {
          const [, path, id, status] = match;
          if (path === 'reservation' || path === 'transaction') {
            const queryParams = action.payload.routerState.root.queryParams;
            return [
              cleanPayment(),
              setPaymentResultParams({
                path,
                id,
                status,
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
          }
        }

        // 7) /me/reservation/:id
        const reservationIdMatch = url.match(/\/me\/reservation\/([^\/]+)$/);
        if (reservationIdMatch) {
          return [
            cleanReservation(),
            getOptions(),
            getUpcomingReservation(),
          ];
        }

        // 8) /me/reservation
        const reservationMatch = url.match(/\/me\/reservation$/);
        if (reservationMatch) {
          if (navigationState && (navigationState['treatment'] !== undefined || navigationState['room'] !== undefined ||
            navigationState['professional'] !== undefined || navigationState['date'] !== undefined ||
            navigationState['discount'] !== undefined)) {
            return [
              cleanReservation(),
              getOptions(),
              setMeReservationParams({
                treatmentId: navigationState['treatmentId'],
                roomId: navigationState['roomId'],
                professionalId: navigationState['professionalId'],
                date: navigationState['date'],
                discountId: navigationState['discountId'],
              }),
              getAllRooms({}),
              getUpcomingReservation(),
            ];
          }
          return [cleanReservation(), getOptions(), getUpcomingReservation(), getAllRooms({})];
        }

        // 9) /me/reservations
        const reservationsMatch = url.match(/\/me\/reservations$/);
        if (reservationsMatch) {
          return [cleanReservation()];
        }

        // 10) /me/overview
        const overviewMatch = url.match(/\/me\/overview$/);
        if (overviewMatch) {
          return [cleanUser()];
        }

        return [];
      }),
    ));
}
