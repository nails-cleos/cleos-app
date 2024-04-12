import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';

const routes: Routes = [
  { path: '', component: AuthComponent, data: { error: 'error' } },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'profile', component: ProfileComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer, Role.roomAdmin]
    }
  },
  {
    path: 'redirect', component: RedirectComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer, Role.roomAdmin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
