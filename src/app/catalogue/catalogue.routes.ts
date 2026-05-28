import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CatalogueComponent } from './catalogue.component';
import { CataloguesComponent } from './list/catalogues.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { CatalogueService } from '../services/catalogue.service';
import { TreatmentService } from '../services/treatment.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { CatalogueEffects } from '../store/effects/catalogue.effects';
import { CATALOGUE_FEATURE_KEY, catalogueReducer } from '../store/reducers/catalogue.reducers';
import { CatalogueNavigationEffects } from './catalogue-navigation.effects';

const providers = [
  provideFeatureTranslations('catalogue'),
  CatalogueService,
  TreatmentService,
  provideState(CATALOGUE_FEATURE_KEY, catalogueReducer),
  provideEffects(CatalogueEffects, CatalogueNavigationEffects),
];

const children: Routes = [
  { path: '', component: CataloguesComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: CatalogueComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: CatalogueComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const CATALOGUE_ROUTES: Routes = [{ path: '', providers, children }];
