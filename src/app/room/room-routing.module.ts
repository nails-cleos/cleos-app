import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { RoomMeComponent } from './me/room-me.component';
import { RoomDetailComponent } from './detail/room-detail.component';
import { AddServiceComponent } from './me/add-service/add-service.component';

const routes: Routes = [
  {
    path: '', component: RoomsComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: 'add', component: RoomComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager]
    }
  },
  {
    path: ':id/services', component: AddServiceComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.manager]
    }
  },
  {
    path: 'me/:id', component: RoomMeComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.professional, Role.manager]
    }
  },
  {
    path: ':id', component: RoomDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.manager]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomRoutingModule {
}
