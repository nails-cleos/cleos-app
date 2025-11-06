import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { CataloguesComponent } from './list/catalogues.component';
import { CatalogueComponent } from './catalogue.component';

const routes: Routes = [
  {
    path: '', component: CataloguesComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: 'add', component: CatalogueComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: ':id', component: CatalogueComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogueRoutingModule {
}
