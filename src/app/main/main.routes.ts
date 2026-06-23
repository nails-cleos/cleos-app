import { Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MainTreatmentComponent } from './treatment/main-treatment.component';
import { provideEffects } from '@ngrx/effects';
import { MainEffects } from '../store/effects/main.effects';
import { MainService } from '../services/main.service';
import { TreatmentService } from '../services/treatment.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideState } from '@ngrx/store';
import { MAIN_FEATURE_KEY, mainReducer } from '../store/reducers/main.reducers';
import { MainNavigationEffects } from './main-navigation.effects';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('main'),
  MainService,
  TreatmentService,
  UserService,
  AuthService,
  {
    provide: LocationStrategy,
    useClass: HashLocationStrategy,
  },
  provideState(MAIN_FEATURE_KEY, mainReducer),
  provideEffects(MainEffects, MainNavigationEffects),
];

const children: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: '', component: MainContentComponent },
      { path: 'catalogs', component: CatalogComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'term-and-conditions', component: TermsAndConditionsComponent },
      { path: ':id/treatment', component: MainTreatmentComponent },
    ],
  },
];

export const MAIN_ROUTES: Routes = [{ path: '', providers, children }];
