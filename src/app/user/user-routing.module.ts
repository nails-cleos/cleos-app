import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { UsersComponent } from './list/users.component';
import { TranslationLoaderResolver } from '../util/translation.resolver';
import { UserComponent } from './user.component';
import { UserDetailComponent } from './detail/user-detail.component';
import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
  {
    path: '', component: UsersComponent, canActivate: [authGuard],
    resolve: {model: TranslationLoaderResolver},
    data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: UserComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: UserDetailComponent, canActivate: [authGuard], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id/overview', component: OverviewComponent, canActivate: [authGuard], data: {
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
