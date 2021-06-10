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
import { AssignmentsComponent } from './assignment/assignments.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationDetailComponent } from './reservation/detail/reservation-detail.component';
import { NotificationsComponent } from './notification/list/notifications.component';
import { RoomMeComponent } from './room/me/room-me.component';
import { CalendarComponent } from './reservation/calendar/calendar.component';
import { CataloguesComponent } from './catalogue/list/catalogues.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { CatalogueDetailComponent } from './catalogue/detail/catalogue-detail.component';
import { CatalogComponent } from './catalog/catalog.component';
import { UnavailableListComponent } from './unavailable/list/unavailable-list.component';
import { UnavailableComponent } from './unavailable/unavailable.component';
import { UnavailableDetailComponent } from './unavailable/detail/unavailable-detail.component';
import { ReservationsComponent } from './reservation/list/reservations.component';
import { MeReservationComponent } from './reservation/me/me-reservation.component';
import { RedirectComponent } from './redirect/redirect.component';

const routes: Routes = [
  {path: '', redirectTo: '/redirect', pathMatch: 'full', resolve: {model: TranslationLoaderResolver}},
  {path: 'auth', component: AuthComponent, data: {error: 'error'}},
  {path: 'activate-account', component: ActivateAccountComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'recovery-password', component: RecoveryPasswordComponent},
  {path: 'catalogs', component: CatalogComponent},
  {path: 'main', component: MainComponent},
  {
    path: 'redirect', component: RedirectComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional, Role.customer]
    }
  },
  {
    path: 'dashboard',
    component: DashComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin, Role.professional]
    }
  },
  {
    path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional, Role.customer]
    }
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional, Role.customer]
    }
  },
  {
    path: 'users',
    component: UsersComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'user/:id', component: UserDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'user', component: UserComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'products',
    component: ProductsComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'product', component: ProductComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'product/:id', component: ProductDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'catalogues',
    component: CataloguesComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'catalogue', component: CatalogueComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'catalogue/:id', component: CatalogueDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'rooms',
    component: RoomsComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'room', component: RoomComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'room/:id', component: RoomDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin]
    }
  },
  {
    path: 'me-room', component: RoomMeComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.professional]
    }
  },
  {
    path: 'reservation', component: ReservationComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional] // TODO Customer not allowed
    }
  },
  {
    path: 'reservation/:id', component: ReservationDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional, Role.customer]
    }, runGuardsAndResolvers: 'always'
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin, Role.professional]
    }
  },
  {
    path: 'assignments',
    component: AssignmentsComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.professional]
    }
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin, Role.professional, Role.customer]
    }
  },
  {
    path: 'unavailable-list',
    component: UnavailableListComponent,
    resolve: {model: TranslationLoaderResolver},
    canActivate: [AuthGuardService],
    data: {
      roles: [Role.admin, Role.professional]
    }
  },
  {
    path: 'unavailable', component: UnavailableComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional]
    }
  },
  {
    path: 'unavailable/:id', component: UnavailableDetailComponent, canActivate: [AuthGuardService], data: {
      roles: [Role.admin, Role.professional]
    }
  },
  {
    path: 'me', canActivate: [AuthGuardService], data: {roles: [Role.customer]}, children: [
      {path: 'reservations', component: ReservationsComponent, resolve: {model: TranslationLoaderResolver}},
      {path: 'reservation', component: MeReservationComponent},
      {path: 'reservation/:id', component: MeReservationComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
