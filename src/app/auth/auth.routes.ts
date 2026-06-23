import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('auth'),
  AuthService,
  UserService,
];

const children: Routes = [
  { path: '', component: AuthComponent, data: { error: 'error' } },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'profile', component: ProfileComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer, Role.roomAdmin],
    },
  },
];

export const AUTH_ROUTES: Routes = [{ path: '', providers, children }];
