import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { AdditionalListComponent } from './list/additional-list.component';
import { AdditionalSortingComponent } from './sorting/additional-sorting.component';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { AdditionalCreatePageComponent } from './additional-create-page.component';
import { AdditionalDetailsPageComponent } from './additional-details-page.component';

const providers = [provideFeatureTranslations('additional')];

const children: Routes = [
  {
    path: '',
    component: AdditionalListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: 'sorting',
    component: AdditionalSortingComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: 'add',
    component: AdditionalCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: ':id',
    component: AdditionalDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
];

export const ADDITIONAL_ROUTES: Routes = [{ path: '', providers, children }];
