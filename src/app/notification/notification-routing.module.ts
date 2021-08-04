import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsComponent } from './list/notifications.component';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';

const routes: Routes = [
  {
    path: '', component: NotificationsComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional, Role.customer]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule {
}
