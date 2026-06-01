import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { TreatmentListComponent } from './list/treatment-list.component';
import { TreatmentGroupSortingComponent } from './sorting/treatment-group-sorting.component';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';
import { TreatmentCreatePageComponent } from './treatment-create-page.component';
import { TreatmentEditPageComponent } from './treatment-edit-page.component';
import { TreatmentViewPageComponent } from './treatment-view-page.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { ColorService } from '../services/color.service';
import { TreatmentService } from '../services/treatment.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { TreatmentEffects } from '../store/effects/treatment.effects';
import { TREATMENT_FEATURE_KEY, treatmentReducer } from '../store/reducers/treatment.reducers';
import { TreatmentNavigationEffects } from './treatment-navigation.effects';

const providers = [
  provideFeatureTranslations('treatment'),
  TreatmentService,
  ColorService,
  provideState(TREATMENT_FEATURE_KEY, treatmentReducer),
  provideEffects(TreatmentEffects, TreatmentNavigationEffects),
];

const children: Routes = [
  { path: '', component: TreatmentListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'sorting', component: TreatmentGroupSortingComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: TreatmentCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id/edit', component: TreatmentEditPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id/view', component: TreatmentViewPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id/sorting', component: TreatmentSortingComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const TREATMENT_ROUTES: Routes = [{ path: '', providers, children }];
