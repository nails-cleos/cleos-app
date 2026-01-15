import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { InvoiceComponent } from './invoice.component';
import { InvoicesComponent } from './invoices/invoices.component';

const routes: Routes = [
  {
    path: '', component: InvoicesComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: 'add', component: InvoiceComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {
}
