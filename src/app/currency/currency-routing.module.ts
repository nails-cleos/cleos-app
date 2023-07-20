import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CurrencyComponent } from './currency.component';
import { CurrencyListComponent } from './list/currency-list.component';
import { CurrencyDetailComponent } from './detail/currency-detail.component';

const routes: Routes = [
  {
    path: '', component: CurrencyListComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: CurrencyComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: CurrencyDetailComponent, canActivate: [authGuard], data: {
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
