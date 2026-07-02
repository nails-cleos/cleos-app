import { Routes } from '@angular/router';
import { Role } from '../interfaces/token';
import { authGuard } from '../services/auth-guard.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { AccountComponent } from './account/account.component';
import { TransactionDetailComponent } from './transaction/detail/transaction-detail.component';
import { TransactionViewComponent } from './transaction/view/transaction-view.component';
import { TransactionComponent } from './transaction/transaction.component';

const providers = [
  provideFeatureTranslations('account'),
];

const children: Routes = [
  {
    path: 'customers/:customerId',
    component: AccountComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional] },
  },
  {
    path: ':id/transactions/add',
    component: TransactionComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer] },
  },
  {
    path: ':id/transactions/view',
    component: TransactionViewComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer] },
  },
  {
    path: ':id/transactions/:transactionId',
    component: TransactionDetailComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer] },
  },
];

export const ACCOUNT_ROUTES: Routes = [{ path: '', providers, children }];
