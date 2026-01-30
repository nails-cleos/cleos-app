import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import { cleanDiscount, getMyReferrals } from '../store/discount.actions';
import {
  cleanReservation,
  getAllRooms,
  getUpcomingReservation,
  setCurrentReservationId,
  setMeReservationParams,
} from '../store/reservation.actions';
import { Router } from '@angular/router';
import { cleanPayment, setCurrentPathId, setCurrentPaymentId, setPaymentResultParams } from '../store/payment.actions';
import { cleanUser, setCurrentUserId } from '../store/user.actions';

@Injectable()
export class MeNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  handleMeNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const navigation = this.router.getCurrentNavigation();
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

        // 3) /me/:path/:id/payment/
        const pathMatch = url.match(/\/me\/([^/]+)\/([^/]+)\/payment\/?$/);
        if (pathMatch) {
          const [, path, id] = pathMatch;
          if (path === 'reservation' || path === 'transaction') {
            return [cleanPayment(), setCurrentPathId({ path, id })];
          }
        }

        // 4) /me/payment/:id
        const paymentIdMatch = url.match(/\/me\/payment\/([^\/]+)$/);
        if (paymentIdMatch) {
          return [cleanPayment(), setCurrentPaymentId({ paymentId: paymentIdMatch[1] })];
        }

        // 5) /me/reservation/:id/payment/option
        const paymentReservationIdMatch = url.match(/\/me\/reservation\/([^\/]+)\/payment\/option$/);
        if (paymentReservationIdMatch) {
          return [
            cleanPayment(),
            cleanReservation(),
            setCurrentReservationId({ reservationId: paymentReservationIdMatch[1] }),
          ];
        }

        // 6) /me/:path/:id/payment/:status
        const match = url.match(/\/me\/([^/]+)\/([^/]+)\/payment\/([^/]+)/);
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
                orderId: queryParams?.['orderId'],
                orderStatusId: queryParams?.['orderStatusId'],
              }),
            ];
          }
        }

        // 7) /me/reservation/:id
        const reservationIdMatch = url.match(/\/me\/reservation\/([^\/]+)$/);
        if (reservationIdMatch) {
          return [cleanReservation(), setCurrentReservationId({ reservationId: reservationIdMatch[1] })];
        }

        // 8) /me/reservation
        const reservationMatch = url.match(/\/me\/reservation$/);
        if (reservationMatch) {
          if (navigationState && (navigationState['treatment'] !== undefined || navigationState['room'] !== undefined ||
            navigationState['professional'] !== undefined || navigationState['date'] !== undefined ||
            navigationState['discount'] !== undefined)) {
            return [
              cleanReservation(),
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
          return [cleanReservation(), getAllRooms({})];
        }

        // 9) /me/reservations
        const reservationsMatch = url.match(/\/me\/reservations$/);
        if (reservationsMatch) {
          return [cleanReservation()];
        }

        // 10) /me/overview
        const overviewMatch = url.match(/\/me\/overview$/);
        if (overviewMatch) {
          return [cleanUser(), setCurrentUserId({ userId: 'me' })];
        }

        return [];
      }),
    ));
}
