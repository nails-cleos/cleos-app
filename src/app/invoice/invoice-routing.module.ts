import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { InvoiceComponent } from './invoice.component';

const routes: Routes = [
  {
    path: '', component: InvoiceComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.roomAdmin]
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule {
}
