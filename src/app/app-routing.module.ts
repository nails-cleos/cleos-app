import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { MainComponent } from './main/main.component';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginComponent } from './login/login.component';
import { Role } from './interfaces/token';
import { TranslationLoaderResolver } from './util/translation.resolver';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  {path: '', redirectTo: '/dashboard/main', pathMatch: 'full'},
  {
    path: 'dashboard', component: DashboardComponent, resolve: {model: TranslationLoaderResolver}, children: [
      {path: 'activate-account', component: ActivateAccountComponent},
      {path: 'login', component: LoginComponent, data: {error: 'error'}},
      {path: 'main', component: MainComponent},
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
