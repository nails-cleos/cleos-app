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
import { provideEffects } from '@ngrx/effects';
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
import { provideState, Store } from '@ngrx/store';
import { ShareButtonsComponent } from './referrals/share-buttons/share-buttons.component';
import { BottomSheetShareComponent } from './referrals/bottom-sheet-share.component';
import { BottomSheetReferralComponent } from './referrals/bottom-sheet-referral.component';
import { DISCOUNT_FEATURE_KEY, discountReducer } from '../store/reducers/discount.reducers';
import { MeNavigationEffects } from './me-navigation.effects';
import { CustomerEditDialogComponent } from '../shared/dialog/customer-edit/customer-edit-dialog.component';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

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
    CustomerEditDialogComponent,
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
    provideState(DISCOUNT_FEATURE_KEY, discountReducer),
    provideEffects(ReservationEffects, PaymentEffects, DiscountEffects, CurrencyEffects, MeNavigationEffects),
  ],
})
export class MeModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      translateService.currentLang = '';
      this.translateService.use(language);
    });
  }
}
