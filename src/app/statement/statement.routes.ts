import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { StatementComponent } from './statement.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { OfficeService } from '../services/office.service';
import { StatementService } from '../services/statement.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { StatementEffects } from '../store/effects/statement.effects';
import { STATEMENT_FEATURE_KEY, statementReducer } from '../store/reducers/statement.reducers';
import { StatementNavigationEffects } from './statement-navigation.effects';

const providers = [
  provideFeatureTranslations('statement'),
  StatementService,
  OfficeService,
  provideState(STATEMENT_FEATURE_KEY, statementReducer),
  provideEffects(StatementEffects, StatementNavigationEffects),
];

const children: Routes = [
  { path: '', component: StatementComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const STATEMENT_ROUTES: Routes = [{ path: '', providers, children }];
