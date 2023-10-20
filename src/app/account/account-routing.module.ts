import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { AccountComponent } from './account/account.component';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionViewComponent } from './transaction/view/transaction-view.component';
import { TransactionDetailComponent } from './transaction/detail/transaction-detail.component';

const routes: Routes = [
  {
    path: 'customers/:customerId', component: AccountComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional]
    }
  },
  {
    path: ':id/transactions/add', component: TransactionComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer]
    }
  },
  {
    path: ':id/transactions/view', component: TransactionViewComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer]
    }
  },
  {
    path: ':id/transactions/:transactionId', component: TransactionDetailComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.roomAdmin, Role.manager, Role.professional, Role.customer]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {
}
