import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { UnavailableComponent } from './unavailable.component';
import { BlockAgendaComponent } from './block-agenda/block-agenda.component';

const routes: Routes = [
  {
    path: '', component: UnavailableListComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.professional],
    },
  },
  {
    path: 'add', component: UnavailableComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.professional],
    },
  },
  {
    path: ':id', component: UnavailableComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.professional],
    },
  },
  {
    path: 'block-agenda/add', component: BlockAgendaComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.professional],
    },
  },
  {
    path: 'block-agenda/:id', component: BlockAgendaComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.professional],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnavailableRoutingModule {
}
