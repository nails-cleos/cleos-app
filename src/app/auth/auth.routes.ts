import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';
import { provideEffects } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { provideState } from '@ngrx/store';
import { AUTH_FEATURE_KEY, authReducer } from '../store/reducers/auth.reducers';
import { AuthNavigationEffects } from './auth-navigation.effects';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('auth'),
  AuthService,
  UserService,
  provideState(AUTH_FEATURE_KEY, authReducer),
  provideEffects(LoginEffects, AuthNavigationEffects),
];

const children: Routes = [
  { path: '', component: AuthComponent, data: { error: 'error' } },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'profile', component: ProfileComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer, Role.roomAdmin],
    },
  },
  {
    path: 'redirect', component: RedirectComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer, Role.roomAdmin],
    },
  },
];

export const AUTH_ROUTES: Routes = [{ path: '', providers, children }];
