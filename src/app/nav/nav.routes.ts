import { Routes } from '@angular/router';
import { NavComponent } from './nav.component';
import { provideEffects } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { provideState } from '@ngrx/store';
import { AUTH_FEATURE_KEY, authReducer } from '../store/reducers/auth.reducers';
import { RESERVATION_FEATURE_KEY, reservationReducer } from '../store/reducers/reservation.reducers';
import { PAYMENT_FEATURE_KEY, paymentReducer } from '../store/reducers/payment.reducers';
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
import { AwsLambdaService } from '../services/aws-lambda.service';
import { DocumentService } from '../services/document.service';
import { StatementService } from '../services/statement.service';
import { InvoiceService } from '../services/invoice.service';
import { CatalogueStore } from '../store/catalogue.store';
import { ColorStore } from '../store/color.store';
import { CurrencyStore } from '../store/currency.store';
import { DocumentStore } from '../store/document.store';
import { StatementStore } from '../store/statement.store';
import { DiscountStore } from '../store/discount.store';
import { AwsStore } from '../store/aws.store';
import { AdditionalStore } from '../store/additional.store';
import { OfficeStore } from '../store/office.store';
import { AccountStore } from '../store/account.store';
import { ExpenseStore } from '../store/expense.store';
import { NoteStore } from '../store/note.store';
import { InvoiceStore } from '../store/invoice.store';
import { UnavailableStore } from '../store/unavailable.store';
import { TreatmentStore } from '../store/treatment.store';
import { RoomStore } from '../store/room.store';
import { UserStore } from '../store/user.store';
import { NotificationStore } from '../store/notification.store';
import { provideGlobalFeedbackSource } from '../store/global-feedback-source';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('dashboard'),
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
  CatalogueStore,
  ColorStore,
  CurrencyStore,
  DocumentStore,
  StatementStore,
  DiscountStore,
  AwsStore,
  AdditionalStore,
  OfficeStore,
  AccountStore,
  ExpenseStore,
  NoteStore,
  NotificationStore,
  InvoiceStore,
  UnavailableStore,
  TreatmentStore,
  RoomStore,
  provideGlobalFeedbackSource(UserStore),
  provideGlobalFeedbackSource(CatalogueStore),
  provideGlobalFeedbackSource(ColorStore),
  provideGlobalFeedbackSource(CurrencyStore),
  provideGlobalFeedbackSource(DocumentStore),
  provideGlobalFeedbackSource(StatementStore),
  provideGlobalFeedbackSource(DiscountStore),
  provideGlobalFeedbackSource(AdditionalStore),
  provideGlobalFeedbackSource(OfficeStore),
  provideGlobalFeedbackSource(AccountStore),
  provideGlobalFeedbackSource(ExpenseStore),
  provideGlobalFeedbackSource(NoteStore),
  provideGlobalFeedbackSource(InvoiceStore),
  provideGlobalFeedbackSource(UnavailableStore),
  provideGlobalFeedbackSource(TreatmentStore),
  provideGlobalFeedbackSource(RoomStore),
  TrackingService,
  AwsLambdaService,
  DocumentService,
  StatementService,
  InvoiceService,
  provideState(AUTH_FEATURE_KEY, authReducer),
  provideState(RESERVATION_FEATURE_KEY, reservationReducer),
  provideState(PAYMENT_FEATURE_KEY, paymentReducer),
  provideEffects(
    LoginEffects,
    ReservationEffects,
    PaymentEffects,
  ),
];

const children: Routes = [
  { path: 'home', loadChildren: () => import('../main/main.routes').then(m => m.MAIN_ROUTES) },
  {
    path: '', component: NavComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'auth', loadChildren: () => import('../auth/auth.routes').then(m => m.AUTH_ROUTES) },
      { path: 'users', loadChildren: () => import('../user/user.routes').then(m => m.USER_ROUTES) },
      { path: 'treatments', loadChildren: () => import('../treatment/treatment.routes').then(m => m.TREATMENT_ROUTES) },
      { path: 'catalogues', loadChildren: () => import('../catalogue/catalogue.routes').then(m => m.CATALOGUE_ROUTES) },
      { path: 'discounts', loadChildren: () => import('../discount/discount.routes').then(m => m.DISCOUNT_ROUTES) },
      { path: 'offices', loadChildren: () => import('../office/office.routes').then(m => m.OFFICE_ROUTES) },
      { path: 'rooms', loadChildren: () => import('../room/room.routes').then(m => m.ROOM_ROUTES) },
      {
        path: 'reservation',
        loadChildren: () => import('../reservation/reservation.routes').then(m => m.RESERVATION_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () => import('../notification/notification.routes').then(m => m.NOTIFICATION_ROUTES),
      },
      {
        path: 'unavailable',
        loadChildren: () => import('../unavailable/unavailable.routes').then(m => m.UNAVAILABLE_ROUTES),
      },
      {
        path: 'additional',
        loadChildren: () => import('../additional/additional.routes').then(m => m.ADDITIONAL_ROUTES),
      },
      { path: 'currency', loadChildren: () => import('../currency/currency.routes').then(m => m.CURRENCY_ROUTES) },
      { path: 'colors', loadChildren: () => import('../color/color.routes').then(m => m.COLOR_ROUTES) },
      { path: 'me', loadChildren: () => import('../me/me.routes').then(m => m.ME_ROUTES) },
      { path: 'invoices', loadChildren: () => import('../invoice/invoice.routes').then(m => m.INVOICE_ROUTES) },
      { path: 'statements', loadChildren: () => import('../statement/statement.routes').then(m => m.STATEMENT_ROUTES) },
      { path: 'documents', loadChildren: () => import('../document/document.routes').then(m => m.DOCUMENT_ROUTES) },
      { path: 'notes', loadChildren: () => import('../note/note.routes').then(m => m.NOTE_ROUTES) },
      { path: 'shortcut', loadChildren: () => import('../shortcut/shortcut.routes').then(m => m.SHORTCUT_ROUTES) },
      { path: 'accounts', loadChildren: () => import('../account/account.routes').then(m => m.ACCOUNT_ROUTES) },
    ],
  },
];

export const NAV_ROUTES: Routes = [{ path: '', providers, children }];
