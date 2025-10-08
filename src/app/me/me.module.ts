import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MeRoutingModule } from './me-routing.module';

import { ReservationsComponent } from './reservation/list/reservations.component';
import { MeReservationComponent } from './reservation/me/me-reservation.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentCompleteComponent } from './payment/complete/payment-complete.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { ReviewDialogComponent } from './reservation/review/review-dialog.component';
import { UpcomingComponent } from './reservation/upcoming/upcoming.component';
import { EffectsModule } from '@ngrx/effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';
import { TreatmentService } from '../services/treatment.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { DiscountService } from '../services/discount.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { CurrencyService } from '../services/currency.service';
import { CurrencyEffects } from '../store/effects/currency.effects';
import { OptionComponent } from './payment/option/option.component';
import { MePaymentComponent } from './payment/me/me-payment.component';
import { ColorService } from '../services/color.service';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';
import { ShareButtonsComponent } from './referrals/share-buttons/share-buttons.component';
import { BottomSheetShareComponent } from './referrals/bottom-sheet-share.component';
import { BottomSheetReferralComponent } from './referrals/bottom-sheet-referral.component';

@NgModule({
  imports: [
    ReservationsComponent,
    MeReservationComponent,
    PaymentComponent,
    PaymentCompleteComponent,
    ReferralsComponent,
    BottomSheetShareComponent,
    BottomSheetReferralComponent,
    MeDiscountComponent,
    ReviewDialogComponent,
    UpcomingComponent,
    OptionComponent,
    MePaymentComponent,
    ShareButtonsComponent,
    MeRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('me'),
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true,
    }),
    EffectsModule.forFeature([ReservationEffects, PaymentEffects, DiscountEffects, CurrencyEffects]),
  ],
  providers: [
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
  ],
})
export class MeModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe((state) => {
      translateService.currentLang = '';
      this.translateService.use(state.language);
    });
  }
}
