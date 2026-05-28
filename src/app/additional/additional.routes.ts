import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { AdditionalListComponent } from './list/additional-list.component';
import { AdditionalSortingComponent } from './sorting/additional-sorting.component';
import { AdditionalComponent } from './additional.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AdditionalService } from '../services/additional.service';
import { TreatmentService } from '../services/treatment.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { AdditionalEffects } from '../store/effects/additional.effects';
import { ADDITIONAL_FEATURE_KEY, additionalReducer } from '../store/reducers/additional.reducers';
import { AdditionalNavigationEffects } from './additional-navigation.effects';

const providers = [
  provideFeatureTranslations('additional'),
  AdditionalService,
  TreatmentService,
  provideState(ADDITIONAL_FEATURE_KEY, additionalReducer),
  provideEffects(AdditionalEffects, AdditionalNavigationEffects),
];

const children: Routes = [
  { path: '', component: AdditionalListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'sorting', component: AdditionalSortingComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: AdditionalComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: AdditionalComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const ADDITIONAL_ROUTES: Routes = [{ path: '', providers, children }];
