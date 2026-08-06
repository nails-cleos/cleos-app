import { Routes } from '@angular/router';
import { NavComponent } from './nav.component';
import { DiscountStore } from '../store/discount.store';
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
import { provideGlobalFeedbackSource } from '../store/global-feedback-source';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { AuthStore } from '../store/auth.store';
import { PaymentStore } from '../store/payment.store';
import { TrackingStore } from '../store/tracking.store';
import { ReservationStore } from '../store/reservation.store';
import { CatalogueStore } from '../store/catalogue.store';
import { ColorStore } from '../store/color.store';
import { CurrencyStore } from '../store/currency.store';
import { DocumentStore } from '../store/document.store';

const providers = [
  provideFeatureTranslations('dashboard'),
  provideGlobalFeedbackSource(UserStore),
  provideGlobalFeedbackSource(CatalogueStore),
  provideGlobalFeedbackSource(ColorStore),
  provideGlobalFeedbackSource(CurrencyStore),
  provideGlobalFeedbackSource(DocumentStore),
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
  provideGlobalFeedbackSource(AuthStore),
  provideGlobalFeedbackSource(PaymentStore),
  provideGlobalFeedbackSource(TrackingStore),
  provideGlobalFeedbackSource(ReservationStore),
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
