import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ReservationsComponent } from './reservation/list/reservations.component';
import { MeReservationComponent } from './reservation/me/me-reservation.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentCompleteComponent } from './payment/complete/payment-complete.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { ReviewDialogComponent } from './reservation/review/review-dialog.component';
import { OverviewComponent } from '../user/overview/overview.component';
import { OptionComponent } from './payment/option/option.component';
import { MePaymentComponent } from './payment/me/me-payment.component';

const routes: Routes = [
  {
    path: 'reservations',
    component: ReservationsComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'reservation',
    component: MeReservationComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: 'reservation/:id',
    component: MeReservationComponent,
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
    path: 'reservation/:id/review',
    component: ReviewDialogComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  {
    path: ':path/:id/payment',
    component: PaymentComponent,
    canActivate: [authGuard],
    data: { roles: [Role.customer] },
  },
  { path: ':path/:id/payment/:status', component: PaymentCompleteComponent },
  { path: 'payment/:id', component: MePaymentComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'referrals', component: ReferralsComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'discounts', component: MeDiscountComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
  { path: 'overview', component: OverviewComponent, canActivate: [authGuard], data: { roles: [Role.customer] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeRoutingModule {
}
