import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeRoutingModule } from './me-routing.module';
import { ReservationsComponent } from './reservation/list/reservations.component';
import { MeReservationComponent } from './reservation/me/me-reservation.component';
import { PaymentComponent } from './reservation/payment/payment.component';
import { PaymentCompleteComponent } from './reservation/payment/complete/payment-complete.component';
import {
  BottomSheetReferralComponent,
  BottomSheetShareComponent,
  ReferralsComponent
} from './referrals/referrals.component';
import { SharedModule } from '../util/SharedModule';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MeDiscountComponent } from '../discount/me/me-discount.component';

@NgModule({
  declarations: [
    ReservationsComponent,
    MeReservationComponent,
    PaymentComponent,
    PaymentCompleteComponent,
    ReferralsComponent,
    BottomSheetShareComponent,
    BottomSheetReferralComponent,
    MeDiscountComponent
  ],
  imports: [
    MeRoutingModule,
    SharedModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    TranslateModule,
    FlexLayoutModule
  ]
})
export class MeModule {
}
