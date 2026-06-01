import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CatalogueListComponent } from './list/catalogue-list.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { CatalogueService } from '../services/catalogue.service';
import { TreatmentService } from '../services/treatment.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { CatalogueEffects } from '../store/effects/catalogue.effects';
import { CATALOGUE_FEATURE_KEY, catalogueReducer } from '../store/reducers/catalogue.reducers';
import { CatalogueNavigationEffects } from './catalogue-navigation.effects';
import { CatalogueCreatePageComponent } from './catalogue-create-page.component';
import { CatalogueDetailsPageComponent } from './catalogue-details-page.component';

const providers = [
  provideFeatureTranslations('catalogue'),
  CatalogueService,
  TreatmentService,
  provideState(CATALOGUE_FEATURE_KEY, catalogueReducer),
  provideEffects(CatalogueEffects, CatalogueNavigationEffects),
];

const children: Routes = [
  { path: '', component: CatalogueListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: CatalogueCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: CatalogueDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const CATALOGUE_ROUTES: Routes = [{ path: '', providers, children }];
