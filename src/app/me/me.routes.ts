import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { OverviewComponent } from '../user/overview/overview.component';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { PaymentRedirectGuard } from './payment/payment-redirect.guard';
import { MePaymentComponent } from './payment/me/me-payment.component';
import { OptionComponent } from './payment/option/option.component';
import { PaymentComponent } from './payment/payment.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { ReservationListComponent } from './reservation/list/reservation-list.component';
import { MeReservationCreatePageComponent } from './reservation/me/me-reservation-create-page.component';
import { MeReservationDetailsPageComponent } from './reservation/me/me-reservation-details-page.component';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { EmptyComponent } from '../util/empty.component';

const providers = [provideFeatureTranslations('me')];

const children: Routes = [
  {
    path: 'reservations',
    component: ReservationListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'reservation',
    component: MeReservationCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'reservation/:id',
    component: MeReservationDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'reservation/:id/payment/option',
    component: OptionComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: ':path/:id/payment',
    canActivate: [authGuard, PaymentRedirectGuard],
    component: EmptyComponent,
    data: { roles: [Role.customer] },
  },
  {
    path: ':path/:id/payments',
    component: PaymentComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'payment/:id',
    component: MePaymentComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'referrals',
    component: ReferralsComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'discounts',
    component: MeDiscountComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'overview',
    component: OverviewComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
];

export const ME_ROUTES: Routes = [{ path: '', providers, children }];
