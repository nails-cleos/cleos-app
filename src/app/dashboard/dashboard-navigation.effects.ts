import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION, RouterNavigationAction } from '@ngrx/router-store';
import { concatMap } from 'rxjs/operators';
import {
  cleanDashboard,
  setDashNavigationParams,
  setMonthlyNavigationParams,
  setQuarterNavigationParams,
  setYearNavigationParams,
} from '../store/dashboard.actions';

@Injectable()
export class DashboardNavigationEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);

  handleDashboardNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      concatMap((action: RouterNavigationAction) => {
        const url = action.payload.routerState.url;
        const navigationState =
          this.router.currentNavigation()?.extras?.state as any;

        // 1) /dashboard/monthly/summary
        const monthlyMatch = url.match(/\/dashboard\/monthly\/summary$/);
        if (monthlyMatch) {
          if (navigationState && (navigationState['step'] !== undefined || navigationState['date'] !== undefined)) {
            return [
              cleanDashboard(),
              setMonthlyNavigationParams({ step: navigationState['step'], date: navigationState['date'] }),
            ];
          }
          return [
            cleanDashboard(),
          ];
        }

        // 2) /dashboard/year/summary
        const yearMatch = url.match(/\/dashboard\/year\/summary$/);
        if (yearMatch) {
          if (navigationState && navigationState['year'] !== undefined) {
            return [
              cleanDashboard(),
              setYearNavigationParams({ year: navigationState['year'] }),
            ];
          }
          return [
            cleanDashboard(),
          ];
        }

        // 3) /dashboard/quarter/summary
        const quarterMatch = url.match(/\/dashboard\/quarter\/summary$/);
        if (quarterMatch) {
          if (navigationState && (navigationState['quarter'] !== undefined || navigationState['year'] !== undefined)) {
            return [
              cleanDashboard(),
              setQuarterNavigationParams({ quarter: navigationState['quarter'], year: navigationState['year'] }),
            ];
          }
          return [
            cleanDashboard(),
          ];
        }

        // 4) /dashboard/event
        const eventMatch = url.match(/\/dashboard\/event$/);
        if (eventMatch) {
          if (navigationState && navigationState['date'] !== undefined) {
            return [
              cleanDashboard(),
              setDashNavigationParams({ date: navigationState['date'], activeDayIsOpen: true }),
            ];
          }
          return [
            cleanDashboard(),
          ];
        }

        // 5) /dashboard
        const mainMatch = url.match(/\/dashboard\/?$/);
        if (mainMatch) {
          if (navigationState && navigationState['date'] !== undefined) {
            return [
              cleanDashboard(),
              setDashNavigationParams({ date: navigationState['date'], activeDayIsOpen: true }),
            ];
          }
          return [
            cleanDashboard(),
          ];
        }

        return [];
      }),
    ));
}
