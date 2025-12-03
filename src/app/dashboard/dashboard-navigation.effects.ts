import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import {
  clean,
  setDashNavigationParams,
  setMonthlyNavigationParams,
  setQuarterNavigationParams,
  setYearNavigationParams,
} from '../store/dashboard.actions';

@Injectable()
export class DashboardNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);

  handleDashboardNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      concatMap((action: RouterNavigatedAction) => {
        const url = action.payload.routerState.url;
        const navigation = this.router.getCurrentNavigation();
        const navigationState = navigation?.extras.state;

        // 1) /dashboard/monthly/summary
        const monthlyMatch = url.match(/\/dashboard\/monthly\/summary$/);
        if (monthlyMatch) {
          if (navigationState && (navigationState['step'] !== undefined || navigationState['date'] !== undefined)) {
            return [
              clean(),
              setMonthlyNavigationParams({ step: navigationState['step'], date: navigationState['date'] }),
            ];
          }
          return [
            clean(),
          ];
        }

        // 2) /dashboard/year/summary
        const yearMatch = url.match(/\/dashboard\/year\/summary$/);
        if (yearMatch) {
          if (navigationState && navigationState['year'] !== undefined) {
            return [
              clean(),
              setYearNavigationParams({ year: navigationState['year'] }),
            ];
          }
        }

        // 3) /dashboard/quarter/summary
        const quarterMatch = url.match(/\/dashboard\/quarter\/summary$/);
        if (quarterMatch) {
          if (navigationState && (navigationState['quarter'] !== undefined || navigationState['year'] !== undefined)) {
            return [
              clean(),
              setQuarterNavigationParams({ quarter: navigationState['quarter'], year: navigationState['year'] }),
            ];
          }
          return [
            clean(),
          ];
        }

        // 4) /dashboard/event
        const eventMatch = url.match(/\/dashboard\/event$/);
        if (eventMatch) {
          if (navigationState && navigationState['date'] !== undefined) {
            return [
              clean(),
              setDashNavigationParams({ date: navigationState['date'], activeDayIsOpen: true }),
            ];
          }
          return [
            clean(),
          ];
        }

        // 5) /dashboard
        const mainMatch = url.match(/\/dashboard\/?$/);
        if (mainMatch) {
          if (navigationState && navigationState['date'] !== undefined) {
            return [
              clean(),
              setDashNavigationParams({ date: navigationState['date'], activeDayIsOpen: true }),
            ];
          }
        }

        return [];
      }),
    ));
}
