import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { InvoiceListComponent } from './list/invoice-list.component';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('invoice'),
];

const children: Routes = [
  { path: '', component: InvoiceListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const INVOICE_ROUTES: Routes = [{ path: '', providers, children }];
