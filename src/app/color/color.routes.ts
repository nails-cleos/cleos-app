import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ColorListComponent } from './list/color-list.component';
import { ColorComponent } from './color.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { ColorService } from '../services/color.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { ColorEffects } from '../store/effects/color.effects';
import { COLOR_FEATURE_KEY, colorReducer } from '../store/reducers/color.reducers';
import { ColorNavigationEffects } from './color-navigation.effects';

const providers = [
  provideFeatureTranslations('color'),
  ColorService,
  provideState(COLOR_FEATURE_KEY, colorReducer),
  provideEffects(ColorEffects, ColorNavigationEffects),
];

const children: Routes = [
  { path: '', component: ColorListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: ColorComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: ColorComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const COLOR_ROUTES: Routes = [{ path: '', providers, children }];
