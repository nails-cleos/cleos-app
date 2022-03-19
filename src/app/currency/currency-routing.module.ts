import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CurrencyComponent } from './currency.component';
import { CurrencyListComponent } from './list/currency-list.component';
import { CurrencyDetailComponent } from './detail/currency-detail.component';

const routes: Routes = [
  {
    path: '', component: CurrencyListComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: CurrencyComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: CurrencyDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CurrencyRoutingModule {
}
