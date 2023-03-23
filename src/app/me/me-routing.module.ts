import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ReservationsComponent } from './reservation/list/reservations.component';
import { MeReservationComponent } from './reservation/me/me-reservation.component';
import { PaymentComponent } from './reservation/payment/payment.component';
import { PaymentCompleteComponent } from './reservation/payment/complete/payment-complete.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { ReviewDialogComponent } from './reservation/review/review-dialog.component';
import { OverviewComponent } from '../user/overview/overview.component';
import { OptionComponent } from "./reservation/payment/option/option.component";

const routes: Routes = [{
  path: '', canActivate: [AuthGuardService], data: { roles: [Role.customer] }, children: [
    { path: 'reservations', component: ReservationsComponent },
    { path: 'reservation', component: MeReservationComponent },
    { path: 'reservation/:id', component: MeReservationComponent },
    { path: 'reservation/:id/payment', component: PaymentComponent },
    { path: 'reservation/:id/payment/option', component: OptionComponent },
    { path: 'reservation/:id/payment/:status', component: PaymentCompleteComponent },
    { path: 'reservation/:id/review', component: ReviewDialogComponent },
    { path: 'referrals', component: ReferralsComponent },
    { path: 'discounts', component: MeDiscountComponent },
    { path: 'overview', component: OverviewComponent },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeRoutingModule {
}
