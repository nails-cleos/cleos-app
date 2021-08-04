import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CataloguesComponent } from './list/catalogues.component';
import { CatalogueComponent } from './catalogue.component';
import { CatalogueDetailComponent } from './detail/catalogue-detail.component';

const routes: Routes = [
  {
    path: '', component: CataloguesComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: CatalogueComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: CatalogueDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogueRoutingModule {
}
