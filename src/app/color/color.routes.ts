import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ColorListComponent } from './list/color-list.component';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { ColorCreatePageComponent } from './color-create-page.component';
import { ColorDetailsPageComponent } from './color-details-page.component';

const providers = [
  provideFeatureTranslations('color'),
];

const children: Routes = [
  { path: '', component: ColorListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: ColorCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: ColorDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const COLOR_ROUTES: Routes = [{ path: '', providers, children }];
