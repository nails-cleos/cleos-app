import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { MonthSummaryComponent } from './month-summary/month-summary.component';
import { YearSummaryComponent } from './year-summary/year-summary.component';
import { QuarterSummaryComponent } from './quarter-summary/quarter-summary.component';
import { DashboardEventComponent } from './events/dashboard-event.component';
import { DashboardService } from '../services/dashboard.service';
import { provideEffects } from '@ngrx/effects';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { ReservationService } from '../services/reservation.service';
import { PaymentService } from '../services/payment.service';
import { TreatmentService } from '../services/treatment.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { ColorService } from '../services/color.service';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('dashboard'),
  DashboardService,
  ReservationService,
  PaymentService,
  TreatmentService,
  RoomService,
  UserService,
  AdditionalService,
  TrackingService,
  ColorService,
  provideEffects(ReservationEffects),
];

const children: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional],
    },
  },
  {
    path: 'monthly/summary', component: MonthSummaryComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager],
    },
  },
  {
    path: 'year/summary', component: YearSummaryComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager],
    },
  },
  {
    path: 'quarter/summary', component: QuarterSummaryComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager],
    },
  },
  {
    path: 'events', component: DashboardEventComponent, canActivate: [authGuard], data: {
      roles: [Role.roomAdmin],
    },
  },
];

export const DASHBOARD_ROUTES: Routes = [{ path: '', providers, children }];
