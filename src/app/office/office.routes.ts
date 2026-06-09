import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { OfficeListComponent } from './list/office-list.component';
import { OfficeCreatePageComponent } from './office-create-page.component';
import { OfficeDetailsPageComponent } from './office-details-page.component';
import { OfficeService } from '../services/office.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('office'),
  OfficeService,
  UserService,
];

const children: Routes = [
  { path: '', component: OfficeListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: OfficeCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: OfficeDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const OFFICE_ROUTES: Routes = [{ path: '', providers, children }];
