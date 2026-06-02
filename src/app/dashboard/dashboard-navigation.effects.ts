import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import {
  cleanDashboard,
  setDashNavigationParams,
  setMonthlyNavigationParams,
  setQuarterNavigationParams,
  setYearNavigationParams,
} from '../store/actions/dashboard.actions';
import { navigation } from '../util/router-navigation.operator';
import { DashboardComponent } from './dashboard.component';
import { DashboardEventComponent } from './events/dashboard-event.component';
import { MonthSummaryComponent } from './month-summary/month-summary.component';
import { QuarterSummaryComponent } from './quarter-summary/quarter-summary.component';
import { YearSummaryComponent } from './year-summary/year-summary.component';

@Injectable()
export class DashboardNavigationEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);

  loadMonthlySummaryPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MonthSummaryComponent, {
        run: () => {
          const navigation = this.router.currentNavigation();

          const navigationState = navigation?.extras.state;
          const params = navigationState ? [
            setMonthlyNavigationParams({ step: navigationState['step'], date: navigationState['date'] }),
          ] : [];

          return [cleanDashboard(), ...params];
        },
      }),
    ));

  loadYearSummaryPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(YearSummaryComponent, {
        run: () => {
          const navigation = this.router.currentNavigation();

          const navigationState = navigation?.extras.state;
          const params = navigationState ? [
            setYearNavigationParams({ year: navigationState['year'] }),
          ] : [];

          return [cleanDashboard(), ...params];
        },
      }),
    ));

  loadQuarterSummaryPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(QuarterSummaryComponent, {
        run: () => {
          const navigation = this.router.currentNavigation();

          const navigationState = navigation?.extras.state;
          const params = navigationState ? [
            setQuarterNavigationParams({ quarter: navigationState['quarter'], year: navigationState['year'] }),
          ] : [];

          return [cleanDashboard(), ...params];
        },
      }),
    ));

  loadEventsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(DashboardEventComponent, {
        run: () => {
          const navigation = this.router.currentNavigation();

          const navigationState = navigation?.extras.state;
          const params = navigationState ? [
            setDashNavigationParams({ date: navigationState['date'], activeDayIsOpen: true }),
          ] : [];

          return [cleanDashboard(), ...params];
        },
      }),
    ));

  loadDashboardPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(DashboardComponent, {
        run: () => {
          const navigation = this.router.currentNavigation();

          const navigationState = navigation?.extras.state;
          const params = navigationState ? [
            setDashNavigationParams({ date: navigationState['date'], activeDayIsOpen: true }),
          ] : [];

          return [cleanDashboard(), ...params];
        },
      }),
    ));
}
