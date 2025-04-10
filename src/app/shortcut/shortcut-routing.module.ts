import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ShortcutComponent } from './shortcut.component';

const routes: Routes = [
  {
    path: ':key', component: ShortcutComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional, Role.customer],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShortcutRoutingModule {
}
