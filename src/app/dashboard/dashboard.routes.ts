import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { MonthSummaryComponent } from './month-summary/month-summary.component';
import { YearSummaryComponent } from './year-summary/year-summary.component';
import { QuarterSummaryComponent } from './quarter-summary/quarter-summary.component';
import { DashboardEventComponent } from './events/dashboard-event.component';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [provideFeatureTranslations('dashboard')];

const children: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.admin, Role.manager, Role.professional],
    },
  },
  {
    path: 'monthly/summary',
    component: MonthSummaryComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.admin, Role.manager],
    },
  },
  {
    path: 'year/summary',
    component: YearSummaryComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.admin, Role.manager],
    },
  },
  {
    path: 'quarter/summary',
    component: QuarterSummaryComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.admin, Role.manager],
    },
  },
  {
    path: 'events',
    component: DashboardEventComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.roomAdmin],
    },
  },
];

export const DASHBOARD_ROUTES: Routes = [{ path: '', providers, children }];
