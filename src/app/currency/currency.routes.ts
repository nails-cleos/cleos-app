import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CurrencyListComponent } from './list/currency-list.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { CurrencyService } from '../services/currency.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { CurrencyEffects } from '../store/effects/currency.effects';
import { CURRENCY_FEATURE_KEY, currencyReducer } from '../store/reducers/currency.reducers';
import { CurrencyNavigationEffects } from './currency-navigation.effects';
import { CurrencyCreatePageComponent } from './currency-create-page.component';
import { CurrencyDetailsPageComponent } from './currency-details-page.component';

const providers = [
  provideFeatureTranslations('currency'),
  CurrencyService,
  provideState(CURRENCY_FEATURE_KEY, currencyReducer),
  provideEffects(CurrencyEffects, CurrencyNavigationEffects),
];

const children: Routes = [
  { path: '', component: CurrencyListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: CurrencyCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: CurrencyDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const CURRENCY_ROUTES: Routes = [{ path: '', providers, children }];
