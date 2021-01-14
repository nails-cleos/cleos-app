import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { MainComponent } from './main/main.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthComponent } from './auth/auth.component';
import { Role } from './interfaces/token';
import { TranslationLoaderResolver } from './util/translation.resolver';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UserComponent } from './user/user.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
  {path: '', redirectTo: '/dashboard/main', pathMatch: 'full'},
  {
    path: 'dashboard', component: DashboardComponent, resolve: {model: TranslationLoaderResolver}, children: [
      {path: 'activate-account', component: ActivateAccountComponent},
      {path: 'auth', component: AuthComponent, data: {error: 'error'}},
      {path: 'forgot-password', component: ForgotPasswordComponent},
      {path: 'recovery-password', component: RecoveryPasswordComponent},
      {path: 'main', component: MainComponent},
      {
        path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.Admin, Role.Professional, Role.Customer]
        }
      },
      {
        path: 'users', component: UsersComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.Admin]
        }
      },
      {
        path: 'user/:id', component: UserDetailComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.Admin]
        }
      },
      {
        path: 'user', component: UserComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.Admin]
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
