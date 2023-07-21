import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { DiscountsComponent } from './list/discounts.component';
import { DiscountComponent } from './discount.component';
import { DiscountDetailComponent } from './detail/discount-detail.component';

const routes: Routes = [
  {
    path: '', component: DiscountsComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: DiscountComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: DiscountDetailComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscountRoutingModule {
}
