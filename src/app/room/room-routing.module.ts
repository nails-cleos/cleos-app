import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { RoomMeComponent } from './me/room-me.component';
import { RoomDetailComponent } from './detail/room-detail.component';

const routes: Routes = [
  {
    path: '', component: RoomsComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'add', component: RoomComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'me', component: RoomMeComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.professional]
    }
  },
  {
    path: ':id', component: RoomDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomRoutingModule {
}
