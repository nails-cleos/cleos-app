import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import {
  cleanReservation,
  getAllRooms,
  getCustomers,
  setDetailReservationParams,
  setReservationParams,
} from '../store/reservation.actions';
import { Router } from '@angular/router';
import { getOptions } from '../store/payment.actions';

@Injectable()
export class ReservationNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  handleReservationNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const navigation = this.router.currentNavigation();
        const navigationState = navigation?.extras.state;

        // 1) /reservation/calendar
        const calendarMatch = url.match(/\/reservation\/calendar$/);
        if (calendarMatch) {
          return [cleanReservation(), getAllRooms({})];
        }

        // 2) /reservation/:id/rooms/:roomId/customer/:customerId/complete
        const completeDetailMatch = url.match(
          /\/reservation\/([^\/]+)\/rooms\/([^\/]+)\/customer\/([^\/]+)\/complete$/);
        if (completeDetailMatch) {
          return [
            cleanReservation(),
            getOptions(),
            setReservationParams({
              isDashboard: navigationState?.['isDashboard'],
            }),
          ];
        }

        // 3) /reservation/:id/more-info
        const moreInfoDetailMatch = url.match(/\/reservation\/([^\/]+)\/more-info$/);
        if (moreInfoDetailMatch) {
          return [cleanReservation()];
        }

        // 4) /reservation/search
        const searchMatch = url.match(/\/reservation\/search$/);
        if (searchMatch) {
          return [cleanReservation(), getCustomers()];
        }

        // 5) /reservation/invoices

        // 6) /reservation/:id/edit
        const editMatch = url.match(/\/reservation\/([^\/]+)\/edit$/);
        if (editMatch) {
          if (navigationState) {
            return [
              cleanReservation(),
              getOptions(),
              setReservationParams({
                customerId: navigationState['customerId'],
                isDashboard: navigationState['isDashboard'],
                treatmentId: navigationState['treatmentId'],
                groupId: navigationState['groupId'],
                roomId: navigationState['roomId'],
                professionalId: navigationState['professionalId'],
                skip: navigationState['skip'],
                date: navigationState['date'],
                additionalIds: navigationState['additionalIds'],
              }),
            ];
          }
          return [cleanReservation(), getOptions()];
        }

        // 7) /reservation/:id
        const detailMatch = url.match(/\/reservation\/([^\/]+)$/);
        if (detailMatch) {
          return [
            cleanReservation(),
            getOptions(),
            setDetailReservationParams({ step: navigationState?.['step'] }),
          ];
        }

        // 8) /reservation
        const baseMatch = url.match(/\/reservation$/);
        if (baseMatch) {
          if (navigationState) {
            return [
              cleanReservation(),
              getCustomers(),
              getOptions(),
              setReservationParams({
                isDashboard: navigationState['isDashboard'],
                skip: navigationState['skip'],
                customerId: navigationState['customerId'],
                treatmentId: navigationState['treatmentId'],
                groupId: navigationState['groupId'],
                roomId: navigationState['roomId'],
                professionalId: navigationState['professionalId'],
                additionalIds: navigationState['additionalIds'],
                date: navigationState['date'],
                discountId: navigationState['discountId'],
              }),
            ];
          }
          return [cleanReservation(), getCustomers(), getOptions()];
        }

        return [];
      }),
    ));
}
