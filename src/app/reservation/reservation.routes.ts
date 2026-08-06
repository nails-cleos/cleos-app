import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CalendarComponent } from './calendar/calendar.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { ReservationCreatePageComponent } from './reservation-create-page.component';
import { ReservationEditPageComponent } from './reservation-edit-page.component';
import { SearchComponent } from './search/search.component';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('reservation'),
];

const children: Routes = [
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager, Role.professional] },
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager, Role.professional] },
  },
  {
    path: '',
    component: ReservationCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional] },
  },
  {
    path: ':id/edit',
    component: ReservationEditPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional] },
  },
  {
    path: ':id',
    component: ReservationDetailComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional, Role.customer] },
    runGuardsAndResolvers: 'always',
  },
  {
    path: ':id/rooms/:roomId/customer/:customerId/complete',
    component: ReservationCompleteComponent,
    canActivate: [authGuard],
    data: { roles: [Role.professional, Role.roomAdmin] },
    runGuardsAndResolvers: 'always',
  },
  {
    path: ':id/more-info',
    component: MoreInfoComponent,
    canActivate: [authGuard],
    data: { roles: [Role.professional, Role.manager, Role.roomAdmin] },
    runGuardsAndResolvers: 'always',
  },
];

export const RESERVATION_ROUTES: Routes = [{ path: '', providers, children }];
