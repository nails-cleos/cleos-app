import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { NoteComponent } from './note.component';

const routes: Routes = [
  {
    path: 'add', component: NoteComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.roomAdmin],
    },
  },
  {
    path: ':id', component: NoteComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.roomAdmin],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRoutingModule {
}
