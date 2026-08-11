import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { TreatmentListComponent } from './list/treatment-list.component';
import { TreatmentGroupSortingComponent } from './sorting/treatment-group-sorting.component';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';
import { TreatmentCreatePageComponent } from './treatment-create-page.component';
import { TreatmentEditPageComponent } from './treatment-edit-page.component';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { TreatmentViewComponent } from './view/treatment-view.component';

const providers = [provideFeatureTranslations('treatment')];

const children: Routes = [
  {
    path: '',
    component: TreatmentListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: 'sorting',
    component: TreatmentGroupSortingComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: 'add',
    component: TreatmentCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: ':id/edit',
    component: TreatmentEditPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: ':id/view',
    component: TreatmentViewComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
  {
    path: ':id/sorting',
    component: TreatmentSortingComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
];

export const TREATMENT_ROUTES: Routes = [{ path: '', providers, children }];
