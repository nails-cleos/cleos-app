import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { TranslationLoaderResolver } from '../util/translation.resolver';
import { OverviewComponent } from './overview/overview.component';
import { UsersComponent } from './list/users.component';
import { UserComponent } from './user.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { UserEffects } from '../store/effects/user.effects';
import { USER_FEATURE_KEY, userReducer } from '../store/reducers/user.reducers';
import { UserNavigationEffects } from './user-navigation.effects';

const providers = [
  provideFeatureTranslations('user'),
  UserService,
  provideState(USER_FEATURE_KEY, userReducer),
  provideEffects(UserEffects, UserNavigationEffects),
];

const children: Routes = [
  {
    path: '',
    component: UsersComponent,
    canActivate: [authGuard],
    resolve: { model: TranslationLoaderResolver },
    data: { roles: [Role.admin] },
  },
  { path: 'add', component: UserComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: UserComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id/overview', component: OverviewComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const USER_ROUTES: Routes = [{ path: '', providers, children }];
