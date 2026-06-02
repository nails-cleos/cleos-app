import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { InvoiceListComponent } from '../invoice/list/invoice-list.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { ReservationCreatePageComponent } from './reservation-create-page.component';
import { ReservationEditPageComponent } from './reservation-edit-page.component';
import { SearchComponent } from './search/search.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AdditionalService } from '../services/additional.service';
import { ColorService } from '../services/color.service';
import { CurrencyService } from '../services/currency.service';
import { DiscountService } from '../services/discount.service';
import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';
import { RoomService } from '../services/room.service';
import { TrackingService } from '../services/tracking.service';
import { TreatmentService } from '../services/treatment.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { PaymentEffects } from '../store/effects/payment.effects';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { RESERVATION_FEATURE_KEY, reservationReducer } from '../store/reducers/reservation.reducers';
import { ReservationNavigationEffects } from './reservation-navigation.effects';

const providers = [
  provideFeatureTranslations('reservation'),
  ReservationService,
  PaymentService,
  TreatmentService,
  RoomService,
  UserService,
  AdditionalService,
  TrackingService,
  ColorService,
  DiscountService,
  CurrencyService,
  provideState(RESERVATION_FEATURE_KEY, reservationReducer),
  provideEffects(ReservationEffects, PaymentEffects, ReservationNavigationEffects),
];

const children: Routes = [
  { path: 'search', component: SearchComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager, Role.professional] } },
  { path: 'invoices', component: InvoiceListComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager, Role.professional] } },
  { path: 'calendar', component: CalendarComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager, Role.professional] } },
  { path: '', component: ReservationCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional] } },
  { path: ':id/edit', component: ReservationEditPageComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional] } },
  { path: ':id', component: ReservationDetailComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional, Role.customer] }, runGuardsAndResolvers: 'always' },
  { path: ':id/rooms/:roomId/customer/:customerId/complete', component: ReservationCompleteComponent, canActivate: [authGuard], data: { roles: [Role.professional, Role.roomAdmin] }, runGuardsAndResolvers: 'always' },
  { path: ':id/more-info', component: MoreInfoComponent, canActivate: [authGuard], data: { roles: [Role.professional, Role.manager, Role.roomAdmin] }, runGuardsAndResolvers: 'always' },
];

export const RESERVATION_ROUTES: Routes = [{ path: '', providers, children }];
