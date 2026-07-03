import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CatalogueListComponent } from './list/catalogue-list.component';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { CatalogueCreatePageComponent } from './catalogue-create-page.component';
import { CatalogueDetailsPageComponent } from './catalogue-details-page.component';

const providers = [
  provideFeatureTranslations('catalogue'),
];

const children: Routes = [
  { path: '', component: CatalogueListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: CatalogueCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: CatalogueDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const CATALOGUE_ROUTES: Routes = [{ path: '', providers, children }];
