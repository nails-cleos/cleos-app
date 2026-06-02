import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { OfficeListComponent } from './list/office-list.component';
import { OfficeComponent } from './office.component';
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
  { path: 'add', component: OfficeComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: OfficeComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const OFFICE_ROUTES: Routes = [{ path: '', providers, children }];
