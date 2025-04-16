import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { TreatmentsComponent } from './list/treatments.component';
import { TreatmentComponent } from './treatment.component';
import { TreatmentViewComponent } from './view/treatment-view.component';
import { TreatmentGroupSortingComponent } from './sorting/treatment-group-sorting.component';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';

const routes: Routes = [
  {
    path: '', component: TreatmentsComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: 'sorting', component: TreatmentGroupSortingComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: 'add', component: TreatmentComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: ':id/edit', component: TreatmentComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: ':id/view', component: TreatmentViewComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  },
  {
    path: ':id/sorting', component: TreatmentSortingComponent, canActivate: [authGuard], data: {
      roles: [Role.admin],
    },
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreatmentRoutingModule {
}
