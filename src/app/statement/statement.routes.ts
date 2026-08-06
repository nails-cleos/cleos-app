import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { StatementCreatePageComponent } from './statement-create-page.component';
import { StatementDetailsPageComponent } from './statement-details-page.component';
import { StatementListComponent } from './list/statement-list.component';

const providers = [
  provideFeatureTranslations('document'),
];

const children: Routes = [
  { path: '', component: StatementListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: 'add', component: StatementCreatePageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
  { path: ':id', component: StatementDetailsPageComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const STATEMENT_ROUTES: Routes = [{ path: '', providers, children }];
