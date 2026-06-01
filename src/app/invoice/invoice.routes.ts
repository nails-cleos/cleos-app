import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { InvoiceListComponent } from './list/invoice-list.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { InvoiceService } from '../services/invoice.service';
import { OfficeService } from '../services/office.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { InvoiceEffects } from '../store/effects/invoice.effects';
import { INVOICE_FEATURE_KEY, invoiceReducer } from '../store/reducers/invoice.reducers';
import { InvoiceNavigationEffects } from './invoice-navigation.effects';

const providers = [
  provideFeatureTranslations('invoice'),
  InvoiceService,
  OfficeService,
  provideState(INVOICE_FEATURE_KEY, invoiceReducer),
  provideEffects(InvoiceEffects, InvoiceNavigationEffects),
];

const children: Routes = [
  { path: '', component: InvoiceListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const INVOICE_ROUTES: Routes = [{ path: '', providers, children }];
