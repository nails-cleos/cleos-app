import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ShortcutComponent } from './shortcut.component';

export const SHORTCUT_ROUTES: Routes = [
  {
    path: ':key', component: ShortcutComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional, Role.customer],
    },
  },
];
