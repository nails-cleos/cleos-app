import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import {
  cleanReservation,
  getAllRooms,
  getCustomers,
  setDetailReservationParams,
  setReservationParams,
} from '../store/reservation.actions';
import { getOptions } from '../store/payment.actions';
import { navigation } from '../store/router-navigation.operator';
import { CalendarComponent } from './calendar/calendar.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { ReservationCreatePageComponent } from './reservation-create-page.component';
import { ReservationEditPageComponent } from './reservation-edit-page.component';
import { SearchComponent } from './search/search.component';

@Injectable()
export class ReservationNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  loadCalendarPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CalendarComponent, {
        run: () => [cleanReservation(), getAllRooms({})],
      }),
    ));

  loadCompletePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ReservationCompleteComponent, {
        run: () => {
          const navigationState = this.router.currentNavigation()?.extras.state;

          return [
            cleanReservation(),
            getOptions(),
            setReservationParams({
              isDashboard: navigationState?.['isDashboard'],
            }),
          ];
        },
      }),
    ));

  loadMoreInfoPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MoreInfoComponent, {
        run: () => [cleanReservation()],
      }),
    ));

  loadSearchPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(SearchComponent, {
        run: () => [cleanReservation(), getCustomers()],
      }),
    ));

  loadReservationCreatePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ReservationCreatePageComponent, {
        run: () => {
          const navigationState = this.router.currentNavigation()?.extras.state;
          const actions: Action[] = [cleanReservation(), getCustomers(), getOptions()];
          if (navigationState) {
            actions.push(this.toReservationParamsAction(navigationState));
          }
          return actions;
        },
      }),
    ));

  loadReservationEditPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ReservationEditPageComponent, {
        run: () => {
          const navigationState = this.router.currentNavigation()?.extras.state;

          const actions: Action[] = [cleanReservation(), getOptions()];
          if (navigationState) {
            actions.push(this.toReservationParamsAction(navigationState));
          }

          return actions;
        },
      }),
    ));

  loadReservationDetailsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(ReservationDetailComponent, {
        run: () => {
          const navigationState = this.router.currentNavigation()?.extras.state;

          return [
            cleanReservation(),
            getOptions(),
            setDetailReservationParams({ step: navigationState?.['step'] }),
          ];
        },
      }),
    ));

  private toReservationParamsAction(navigationState: Record<string, unknown>) {
    return setReservationParams({
      customerId: navigationState['customerId'] as string | undefined,
      isDashboard: navigationState['isDashboard'] as boolean | undefined,
      treatmentId: navigationState['treatmentId'] as string | undefined,
      groupId: navigationState['groupId'] as string | undefined,
      roomId: navigationState['roomId'] as string | undefined,
      professionalId: navigationState['professionalId'] as string | undefined,
      skip: navigationState['skip'] as boolean | undefined,
      date: navigationState['date'] as Date | undefined,
      additionalIds: navigationState['additionalIds'] as string[] | undefined,
      discountId: navigationState['discountId'] as string | undefined,
    });
  }
}
