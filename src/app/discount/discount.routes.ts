import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { DiscountListComponent } from './list/discount-list.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { CurrencyService } from '../services/currency.service';
import { DiscountService } from '../services/discount.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { DiscountEffects } from '../store/effects/discount.effects';
import { UserEffects } from '../store/effects/user.effects';
import { DISCOUNT_FEATURE_KEY, discountReducer } from '../store/reducers/discount.reducers';
import { DiscountNavigationEffects } from './discount-navigation.effects';
import { DiscountCreatePageComponent } from './discount-create-page.component';
import { DiscountDetailsPageComponent } from './discount-details-page.component';

const providers = [
  provideFeatureTranslations('discount'),
  DiscountService,
  UserService,
  CurrencyService,
  provideState(DISCOUNT_FEATURE_KEY, discountReducer),
  provideEffects(DiscountEffects, UserEffects, DiscountNavigationEffects),
];

const children: Routes = [
  { path: '', component: DiscountListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: DiscountCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: DiscountDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const DISCOUNT_ROUTES: Routes = [{ path: '', providers, children }];
