import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { DiscountListComponent } from './list/discount-list.component';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { DiscountCreatePageComponent } from './discount-create-page.component';
import { DiscountDetailsPageComponent } from './discount-details-page.component';

const providers = [
  provideFeatureTranslations('discount'),
];

const children: Routes = [
  { path: '', component: DiscountListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: DiscountCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: DiscountDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const DISCOUNT_ROUTES: Routes = [{ path: '', providers, children }];
