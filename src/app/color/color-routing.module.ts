import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ColorComponent } from './color.component';
import { ColorListComponent } from './list/color-list.component';

const routes: Routes = [
  {
    path: '', component: ColorListComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: 'add', component: ColorComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: ':id', component: ColorComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColorRoutingModule {
}
