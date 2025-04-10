import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { OfficeComponent } from './office.component';
import { OfficeListComponent } from './list/office-list.component';

const routes: Routes = [
  {
    path: '', component: OfficeListComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: 'add', component: OfficeComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: ':id', component: OfficeComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfficeRoutingModule {
}
