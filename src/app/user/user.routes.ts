import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { TranslationLoaderResolver } from '../util/translation.resolver';
import { OverviewComponent } from './overview/overview.component';
import { UserListComponent } from './list/user-list.component';
import { UserCreatePageComponent } from './user-create-page.component';
import { UserDetailsPageComponent } from './user-details-page.component';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('user'),
  UserService,
];

const children: Routes = [
  {
    path: '',
    component: UserListComponent,
    canActivate: [authGuard],
    resolve: { model: TranslationLoaderResolver },
    data: { roles: [Role.admin] },
  },
  { path: 'add', component: UserCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: UserDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id/overview', component: OverviewComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const USER_ROUTES: Routes = [{ path: '', providers, children }];
