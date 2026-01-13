import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideEffects } from '@ngrx/effects';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { ReservationRoutingModule } from './reservation-routing.module';

import { SearchComponent } from './search/search.component';
import { ReservationComponent } from './reservation.component';
import { SelectProfessionalDialogComponent } from './select-professional-dialog.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { ChangeColorDialogComponent } from './detail/change-color-dialog.component';
import { ChangeCustomerDialogComponent } from './detail/change-customer-dialog.component';
import { AddNoteDialogComponent } from './detail/add-note-dialog.component';
import { AddDiscountDialogComponent } from './detail/add-discount-dialog.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { CalendarComponent } from './calendar/calendar.component';

import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';
import { TreatmentService } from '../services/treatment.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { ColorService } from '../services/color.service';
import { DiscountService } from '../services/discount.service';

import { ReservationEffects } from '../store/effects/reservation.effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { CurrencyService } from '../services/currency.service';
import { provideState, Store } from '@ngrx/store';
import { FabMenuComponent } from './detail/fab-menu/fab-menu.component';
import { FormFieldAdderComponent } from '../shared/form-field-adder/form-field-adder.component';
import { CancelDialogComponent } from '../shared/dialog/cancel/cancel-dialog.component';
import { CustomerEditDialogComponent } from '../shared/dialog/customer-edit/customer-edit-dialog.component';
import { RESERVATION_FEATURE_KEY, reservationReducer } from '../store/reducers/reservation.reducers';
import { ReservationNavigationEffects } from './reservation-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    SearchComponent,
    ReservationComponent,
    ReservationDetailComponent,
    MoreInfoComponent,
    CalendarComponent,
    ReservationCompleteComponent,
    ChangeCustomerDialogComponent,
    ChangeColorDialogComponent,
    SelectProfessionalDialogComponent,
    AddNoteDialogComponent,
    AddDiscountDialogComponent,
    FabMenuComponent,
    CancelDialogComponent,
    CustomerEditDialogComponent,
    FormFieldAdderComponent,
    ReservationRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('reservation'),
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
    ColorService,
    DiscountService,
    CurrencyService,
    provideState(RESERVATION_FEATURE_KEY, reservationReducer),
    provideEffects(ReservationEffects, PaymentEffects, DiscountEffects, ReservationNavigationEffects),
  ],
})
export class ReservationModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
