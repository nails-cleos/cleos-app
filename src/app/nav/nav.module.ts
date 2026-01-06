import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NavRoutingModule } from './nav-routing.module';
import { NavComponent } from './nav.component';
import { provideEffects } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { UserEffects } from '../store/effects/user.effects';
import { RoomEffects } from '../store/effects/room.effects';
import { TreatmentEffects } from '../store/effects/treatment.effects';
import { CatalogueEffects } from '../store/effects/catalogue.effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { UnavailableEffects } from '../store/effects/unavailable.effects';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { AdditionalEffects } from '../store/effects/additional.effects';
import { CurrencyEffects } from '../store/effects/currency.effects';
import { OfficeEffects } from '../store/effects/office.effects';
import { ColorEffects } from '../store/effects/color.effects';
import { ExpenseEffects } from '../store/effects/expense.effects';
import { NoteEffects } from '../store/effects/note.effects';
import { AccountEffects } from '../store/effects/account.effects';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideState } from '@ngrx/store';
import { AUTH_FEATURE_KEY, authReducer } from '../store/reducers/auth.reducers';
import { NOTIFICATION_FEATURE_KEY, notificationReducer } from '../store/reducers/notification.reducers';
import { USER_FEATURE_KEY, userReducer } from '../store/reducers/user.reducers';
import { ROOM_FEATURE_KEY, roomReducer } from '../store/reducers/room.reducers';
import { TREATMENT_FEATURE_KEY, treatmentReducer } from '../store/reducers/treatment.reducers';
import { CATALOGUE_FEATURE_KEY, catalogueReducer } from '../store/reducers/catalogue.reducers';
import { DISCOUNT_FEATURE_KEY, discountReducer } from '../store/reducers/discount.reducers';
import { UNAVAILABLE_FEATURE_KEY, unavailableReducer } from '../store/reducers/unavailable.reducers';
import { RESERVATION_FEATURE_KEY, reservationReducer } from '../store/reducers/reservation.reducers';
import { PAYMENT_FEATURE_KEY, paymentReducer } from '../store/reducers/payment.reducers';
import { ADDITIONAL_FEATURE_KEY, additionalReducer } from '../store/reducers/additional.reducers';
import { CURRENCY_FEATURE_KEY, currencyReducer } from '../store/reducers/currency.reducers';
import { OFFICE_FEATURE_KEY, officeReducer } from '../store/reducers/office.reducers';
import { COLOR_FEATURE_KEY, colorReducer } from '../store/reducers/color.reducers';
import { EXPENSE_FEATURE_KEY, expenseReducer } from '../store/reducers/expense.reducers';
import { NOTE_FEATURE_KEY, noteReducer } from '../store/reducers/note.reducers';
import { ACCOUNT_FEATURE_KEY, accountReducer } from '../store/reducers/account.reducers';
import { RoomService } from '../services/room.service';
import { TreatmentService } from '../services/treatment.service';
import { CatalogueService } from '../services/catalogue.service';
import { DiscountService } from '../services/discount.service';
import { UnavailableService } from '../services/unavailable.service';
import { ReservationService } from '../services/reservation.service';
import { PaymentService } from '../services/payment.service';
import { AdditionalService } from '../services/additional.service';
import { CurrencyService } from '../services/currency.service';
import { OfficeService } from '../services/office.service';
import { ColorService } from '../services/color.service';
import { ExpenseService } from '../services/expense.service';
import { NoteService } from '../services/note.service';
import { AccountService } from '../services/account.service';
import { TrackingService } from '../services/tracking.service';
import { AWS_FEATURE_KEY, awsReducer } from '../store/reducers/aws.reducers';
import { AwsLambdaService } from '../services/aws-lambda.service';

@NgModule({
  imports: [
    NavComponent,
    MenuItemComponent,
    NavRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('dashboard'),
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
    AuthService,
    NotificationService,
    UserService,
    RoomService,
    TreatmentService,
    CatalogueService,
    DiscountService,
    UnavailableService,
    ReservationService,
    PaymentService,
    AdditionalService,
    CurrencyService,
    OfficeService,
    ColorService,
    ExpenseService,
    NoteService,
    AccountService,
    TrackingService,
    AwsLambdaService,
    provideState(AUTH_FEATURE_KEY, authReducer),
    provideState(NOTIFICATION_FEATURE_KEY, notificationReducer),
    provideState(USER_FEATURE_KEY, userReducer),
    provideState(ROOM_FEATURE_KEY, roomReducer),
    provideState(TREATMENT_FEATURE_KEY, treatmentReducer),
    provideState(CATALOGUE_FEATURE_KEY, catalogueReducer),
    provideState(DISCOUNT_FEATURE_KEY, discountReducer),
    provideState(UNAVAILABLE_FEATURE_KEY, unavailableReducer),
    provideState(RESERVATION_FEATURE_KEY, reservationReducer),
    provideState(PAYMENT_FEATURE_KEY, paymentReducer),
    provideState(ADDITIONAL_FEATURE_KEY, additionalReducer),
    provideState(CURRENCY_FEATURE_KEY, currencyReducer),
    provideState(OFFICE_FEATURE_KEY, officeReducer),
    provideState(COLOR_FEATURE_KEY, colorReducer),
    provideState(EXPENSE_FEATURE_KEY, expenseReducer),
    provideState(NOTE_FEATURE_KEY, noteReducer),
    provideState(ACCOUNT_FEATURE_KEY, accountReducer),
    provideState(AWS_FEATURE_KEY, awsReducer),
    provideEffects(
      LoginEffects,
      NotificationEffects,
      UserEffects,
      RoomEffects,
      TreatmentEffects,
      CatalogueEffects,
      DiscountEffects,
      UnavailableEffects,
      ReservationEffects,
      PaymentEffects,
      AdditionalEffects,
      CurrencyEffects,
      OfficeEffects,
      ColorEffects,
      ExpenseEffects,
      NoteEffects,
      AccountEffects,
      AwsLambdaService,
    ),
  ],
})
export class NavModule {
}
