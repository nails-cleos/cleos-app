import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { Role } from './interfaces/token';
import { TranslationLoaderResolver } from './util/translation.resolver';
import { NotificationsComponent } from './notification/list/notifications.component';
import { RedirectComponent } from './redirect/redirect.component';
import { NavComponent } from './nav/nav.component';

const routes: Routes = [
  {
    path: '', component: NavComponent, resolve: {model: TranslationLoaderResolver}, children: [
      {
        path: 'redirect', component: RedirectComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional, Role.customer]
        }
      },
      {path: 'dashboard', loadChildren: () => import('./dash/dash.module').then(m => m.DashModule)},
      {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
      {path: 'users', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
      {path: 'products', loadChildren: () => import('./product/product.module').then(m => m.ProductModule)},
      {path: 'catalogues', loadChildren: () => import('./catalogue/catalogue.module').then(m => m.CatalogueModule)},
      {path: 'discounts', loadChildren: () => import('./discount/discount.module').then(m => m.DiscountModule)},
      {path: 'rooms', loadChildren: () => import('./room/room.module').then(m => m.RoomModule)},
      {
        path: 'reservation',
        loadChildren: () => import('./reservation/reservation.module').then(m => m.ReservationModule)
      },
      {
        path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuardService], data: {
          roles: [Role.admin, Role.professional, Role.customer]
        }
      },
      {
        path: 'unavailable',
        loadChildren: () => import('./unavailable/unavailable.module').then(m => m.UnavailableModule)
      },
      {path: 'me', loadChildren: () => import('./me/me.module').then(m => m.MeModule)}
    ]
  },
  {path: 'main', loadChildren: () => import('./main/main.module').then(m => m.MainModule)},
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
