import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ProductsComponent } from './list/products.component';
import { ProductComponent } from './product.component';
import { ProductDetailComponent } from './detail/product-detail.component';
import { ProductViewComponent } from './view/product-view.component';

const routes: Routes = [
  {
    path: '', component: ProductsComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: ProductComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id/edit', component: ProductDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id/view', component: ProductViewComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule {
}
