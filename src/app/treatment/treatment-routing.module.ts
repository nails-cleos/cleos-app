import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { TreatmentsComponent } from './list/treatments.component';
import { TreatmentComponent } from './treatment.component';
import { TreatmentDetailComponent } from './detail/treatment-detail.component';
import { TreatmentViewComponent } from './view/treatment-view.component';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';

const routes: Routes = [
  {
    path: '', component: TreatmentsComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'sorting', component: TreatmentSortingComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: TreatmentComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id/edit', component: TreatmentDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: ':id/view', component: TreatmentViewComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TreatmentRoutingModule {
}
