import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnavailableListComponent } from '../unavailable/list/unavailable-list.component';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { UnavailableComponent } from '../unavailable/unavailable.component';
import { UnavailableDetailComponent } from '../unavailable/detail/unavailable-detail.component';
import { AdditionalComponent } from './additional.component';
import { AdditionalListComponent } from './list/additional-list.component';
import { AdditionalDetailComponent } from './detail/additional-detail.component';

const routes: Routes = [
  {
    path: '', component: AdditionalListComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: AdditionalComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id', component: AdditionalDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdditionalRoutingModule {
}
