import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { Role } from '../interfaces/token';
import { authGuard } from '../services/auth-guard.service';
import { AccountService } from '../services/account.service';
import { PaymentService } from '../services/payment.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { AccountEffects } from '../store/effects/account.effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { ACCOUNT_FEATURE_KEY, accountReducer } from '../store/reducers/account.reducers';
import { AccountNavigationEffects } from './account-navigation.effects';
import { AccountComponent } from './account/account.component';
import { TransactionDetailComponent } from './transaction/detail/transaction-detail.component';
import { TransactionViewComponent } from './transaction/view/transaction-view.component';
import { TransactionComponent } from './transaction/transaction.component';

const providers = [
  provideFeatureTranslations('account'),
  AccountService,
  PaymentService,
  provideState(ACCOUNT_FEATURE_KEY, accountReducer),
  provideEffects(AccountEffects, PaymentEffects, AccountNavigationEffects),
];

const children: Routes = [
  { path: 'customers/:customerId', component: AccountComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional] } },
  { path: ':id/transactions/add', component: TransactionComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer] } },
  { path: ':id/transactions/view', component: TransactionViewComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer] } },
  { path: ':id/transactions/:transactionId', component: TransactionDetailComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer] } },
];

export const ACCOUNT_ROUTES: Routes = [{ path: '', providers, children }];
