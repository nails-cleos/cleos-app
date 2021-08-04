import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { UsersComponent } from './list/users.component';
import { TranslationLoaderResolver } from '../util/translation.resolver';
import { UserComponent } from './user.component';
import { UserDetailComponent } from './detail/user-detail.component';

const routes: Routes = [
  {
    path: '', component: UsersComponent, canActivate: [AuthGuardService],
    resolve: {model: TranslationLoaderResolver},
    data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: UserComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: UserDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
