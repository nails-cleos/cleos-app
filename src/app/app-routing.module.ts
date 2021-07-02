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
import { SearchComponent } from './reservation/search/search.component';
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
import { ReferralsComponent } from './referrals/referrals.component';
import { DiscountsComponent } from './discount/list/discounts.component';
import { DiscountComponent } from './discount/discount.component';
import { DiscountDetailComponent } from './discount/detail/discount-detail.component';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { NavComponent } from './nav/nav.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MainContentComponent } from './main/main-content/main-content.component';

const routes: Routes = [
  {
    path: '', component: NavComponent, resolve: {model: TranslationLoaderResolver}, children: [
      {path: 'auth', component: AuthComponent, data: {error: 'error'}},
      {path: 'activate-account', component: ActivateAccountComponent},
      {path: 'forgot-password', component: ForgotPasswordComponent},
      {path: 'recovery-password', component: RecoveryPasswordComponent},
      {
        path: 'redirect', component: RedirectComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional, Role.customer]
        }
      },
      {
        path: 'dashboard', component: DashComponent, canActivate: [AuthGuardService], data: {
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
        path: 'users', component: UsersComponent, canActivate: [AuthGuardService],
        resolve: {model: TranslationLoaderResolver},
        data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'users/add', component: UserComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'users/:id', component: UserDetailComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'products', component: ProductsComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'products/add', component: ProductComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'products/:id', component: ProductDetailComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'catalogues', component: CataloguesComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'catalogues/add', component: CatalogueComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'catalogues/:id', component: CatalogueDetailComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'rooms', component: RoomsComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'rooms/add', component: RoomComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'rooms/:id', component: RoomDetailComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'discounts', component: DiscountsComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'discounts/add', component: DiscountComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'discounts/:id', component: DiscountDetailComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin]
        }
      },
      {
        path: 'me-room', component: RoomMeComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.professional]
        }
      },
      {
        path: 'reservation/search', component: SearchComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.professional]
        }
      },
      {
        path: 'reservation', component: ReservationComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional] // TODO Customer not allowed
        }
      },
      {
        path: 'reservation/:id/edit', component: ReservationComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional] // TODO Customer not allowed
        }
      },
      {
        path: 'reservation/:id', component: ReservationDetailComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional, Role.customer]
        }, runGuardsAndResolvers: 'always'
      },
      {
        path: 'calendar', component: CalendarComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional]
        }
      },
      {
        path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional, Role.customer]
        }
      },
      {
        path: 'unavailable', component: UnavailableListComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional]
        }
      },
      {
        path: 'unavailable/add', component: UnavailableComponent, canActivate: [AuthGuardService], data: {
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
          {path: 'reservations', component: ReservationsComponent},
          {path: 'reservation', component: MeReservationComponent},
          {path: 'reservation/:id', component: MeReservationComponent},
          {path: 'referrals', component: ReferralsComponent},
          {path: 'discounts', component: MeDiscountComponent}
        ]
      }
    ]
  },
  {
    path: 'main', component: MainComponent, children: [
      {path: '', component: MainContentComponent},
      {path: 'catalogs', component: CatalogComponent},
      {path: 'privacy', component: PrivacyComponent},
      {path: 'term-and-conditions', component: TermsAndConditionsComponent}
    ]
  },
  {path: '**', redirectTo: '/main', pathMatch: 'full', resolve: {model: TranslationLoaderResolver}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    onSameUrlNavigation: 'reload',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
