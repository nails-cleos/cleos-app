import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';

const routes: Routes = [
  {path: '', component: AuthComponent, data: {error: 'error'}},
  {path: 'activate-account', component: ActivateAccountComponent},
  {path: 'recovery-password', component: RecoveryPasswordComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {
    path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer, Role.roomAdmin]
    }
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.customer, Role.roomAdmin]
    }
  },
  {
    path: 'redirect', component: RedirectComponent, canActivate: [AuthGuardService], data: {
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
