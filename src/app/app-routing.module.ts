import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './user/list/users.component';
import { UserDetailComponent } from './user/detail/user-detail.component';
import { MainComponent } from './main/main.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthComponent } from './auth/auth.component';
import { Role } from './interfaces/token';
import { TranslationLoaderResolver } from './util/translation.resolver';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UserComponent } from './user/user.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileComponent } from './profile/profile.component';
import { DashComponent } from './dash/dash.component';
import { ProductsComponent } from './product/list/products.component';
import { ProductComponent } from './product/product.component';
import { ProductDetailComponent } from './product/detail/product-detail.component';
import { RoomsComponent } from './room/list/rooms.component';
import { RoomComponent } from './room/room.component';
import { RoomDetailComponent } from './room/detail/room-detail.component';
import { ReservationsComponent } from './reservation/list/reservations.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationDetailComponent } from './reservation/detail/reservation-detail.component';

const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full', resolve: {model: TranslationLoaderResolver}},
  {path: 'auth', component: AuthComponent, data: {error: 'error'}},
  {path: 'activate-account', component: ActivateAccountComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'recovery-password', component: RecoveryPasswordComponent},
  {path: 'main', component: MainComponent},
  {
    path: 'dashboard', component: DashComponent, resolve: {model: TranslationLoaderResolver}, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin, Role.Professional]
    }
  },
  {
    path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin, Role.Professional, Role.Customer]
    }
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin, Role.Professional, Role.Customer]
    }
  },
  {
    path: 'users', component: UsersComponent, resolve: {model: TranslationLoaderResolver}, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'user/:id', component: UserDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'user', component: UserComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'products', component: ProductsComponent, resolve: {model: TranslationLoaderResolver}, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'product', component: ProductComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'product/:id', component: ProductDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'rooms', component: RoomsComponent, resolve: {model: TranslationLoaderResolver}, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'room', component: RoomComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'room/:id', component: RoomDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin]
    }
  },
  {
    path: 'reservations', component: ReservationsComponent, resolve: {model: TranslationLoaderResolver}, canActivate: [AuthGuardService],
    data: {
      roles: [Role.Admin, Role.Professional]
    }
  },
  {
    path: 'reservation', component: ReservationComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin, Role.Professional]
    }
  },
  {
    path: 'reservation/:id', component: ReservationDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.Admin, Role.Professional]
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
