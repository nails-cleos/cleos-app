import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashComponent } from './dash.component';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { MonthSummaryComponent } from './month-summary/month-summary.component';

const routes: Routes = [
  {
    path: '', component: DashComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.professional]
    }
  },
  {
    path: 'monthly/summary', component: MonthSummaryComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager, Role.roomAdmin, Role.professional]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashRoutingModule {
}
