import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CurrencyListComponent } from './list/currency-list.component';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { CurrencyCreatePageComponent } from './currency-create-page.component';
import { CurrencyDetailsPageComponent } from './currency-details-page.component';

const providers = [provideFeatureTranslations('currency')];

const children: Routes = [
  {
    path: '',
    component: CurrencyListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: 'add',
    component: CurrencyCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: ':id',
    component: CurrencyDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
];

export const CURRENCY_ROUTES: Routes = [{ path: '', providers, children }];
