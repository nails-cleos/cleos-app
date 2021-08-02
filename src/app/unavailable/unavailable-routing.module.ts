import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { UnavailableComponent } from './unavailable.component';
import { UnavailableDetailComponent } from './detail/unavailable-detail.component';

const routes: Routes = [
  {
    path: '', component: UnavailableListComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional]
    }
  },
  {
    path: 'add', component: UnavailableComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional]
    }
  },
  {
    path: ':id', component: UnavailableDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnavailableRoutingModule {
}
