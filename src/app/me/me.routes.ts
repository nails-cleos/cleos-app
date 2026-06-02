import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { OverviewComponent } from '../user/overview/overview.component';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { PaymentCompleteComponent } from './payment/complete/payment-complete.component';
import { MePaymentComponent } from './payment/me/me-payment.component';
import { OptionComponent } from './payment/option/option.component';
import { PaymentComponent } from './payment/payment.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { ReservationListComponent } from './reservation/list/reservation-list.component';
import { MeReservationCreatePageComponent } from './me-reservation-create-page.component';
import { MeReservationDetailsPageComponent } from './me-reservation-details-page.component';
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
import { DiscountEffects } from '../store/effects/discount.effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { DISCOUNT_FEATURE_KEY, discountReducer } from '../store/reducers/discount.reducers';
import { MeNavigationEffects } from './me-navigation.effects';

const providers = [
  provideFeatureTranslations('me'),
  ReservationService,
  PaymentService,
  TreatmentService,
  RoomService,
  UserService,
  AdditionalService,
  TrackingService,
  DiscountService,
  CurrencyService,
  ColorService,
  provideState(DISCOUNT_FEATURE_KEY, discountReducer),
  provideEffects(ReservationEffects, PaymentEffects, DiscountEffects, MeNavigationEffects),
];

const children: Routes = [
  { path: 'reservations', component: ReservationListComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'reservation', component: MeReservationCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'reservation/:id', component: MeReservationDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'reservation/:id/payment/option', component: OptionComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: ':path/:id/payment', component: PaymentComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: ':path/:id/payment/:status', component: PaymentCompleteComponent },
  { path: 'payment/:id', component: MePaymentComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'referrals', component: ReferralsComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'discounts', component: MeDiscountComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'overview', component: OverviewComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
];

export const ME_ROUTES: Routes = [{ path: '', providers, children }];
