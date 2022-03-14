import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
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
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { ReviewDialogComponent } from './reservation/review/review-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { UpcomingComponent } from './reservation/upcoming/upcoming.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';
import { ProductService } from '../services/product.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { DiscountService } from '../services/discount.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

@NgModule({
  declarations: [
    ReservationsComponent,
    MeReservationComponent,
    PaymentComponent,
    PaymentCompleteComponent,
    ReferralsComponent,
    BottomSheetShareComponent,
    BottomSheetReferralComponent,
    MeDiscountComponent,
    ReviewDialogComponent,
    UpcomingComponent
  ],
  imports: [
    MeRoutingModule,
    SharedModule,
    MatChipsModule,
    ShareButtonsModule,
    MatBottomSheetModule,
    ShareIconsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatStepperModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('me')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([ReservationEffects, PaymentEffects, DiscountEffects])
  ],
  providers: [
    ReservationService,
    PaymentService,
    ProductService,
    RoomService,
    UserService,
    AdditionalService,
    TrackingService,
    DiscountService
  ]
})
export class MeModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
