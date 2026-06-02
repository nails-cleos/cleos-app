import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { StatementListComponent } from './list/statement-list.component';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('statement'),
];

const children: Routes = [
  { path: '', component: StatementListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const STATEMENT_ROUTES: Routes = [{ path: '', providers, children }];
