import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavComponent } from './nav.component';
import { TranslationLoaderResolver } from '../util/translation.resolver';

const routes: Routes = [
  {
    path: '', component: NavComponent, resolve: { model: TranslationLoaderResolver }, children: [
      {
        path: 'dashboard', loadChildren: () => import('../dash/dash.module').then(m => m.DashModule)
      }, {
        path: 'auth', loadChildren: () => import('../auth/auth.module').then(m => m.AuthModule)
      }, {
        path: 'users', loadChildren: () => import('../user/user.module').then(m => m.UserModule)
      }, {
        path: 'treatments', loadChildren: () => import('../treatment/treatment.module').then(m => m.TreatmentModule)
      }, {
        path: 'catalogues', loadChildren: () => import('../catalogue/catalogue.module').then(m => m.CatalogueModule)
      }, {
        path: 'discounts', loadChildren: () => import('../discount/discount.module').then(m => m.DiscountModule)
      }, {
        path: 'offices', loadChildren: () => import('../office/office.module').then(m => m.OfficeModule)
      }, {
        path: 'rooms', loadChildren: () => import('../room/room.module').then(m => m.RoomModule)
      }, {
        path: 'reservation',
        loadChildren: () => import('../reservation/reservation.module').then(m => m.ReservationModule)
      }, {
        path: 'notifications',
        loadChildren: () => import('../notification/notification.module').then(m => m.NotificationModule)
      }, {
        path: 'unavailable',
        loadChildren: () => import('../unavailable/unavailable.module').then(m => m.UnavailableModule)
      }, {
        path: 'additional',
        loadChildren: () => import('../additional/additional.module').then(m => m.AdditionalModule)
      }, {
        path: 'currency',
        loadChildren: () => import('../currency/currency.module').then(m => m.CurrencyModule)
      }, {
        path: 'colors',
        loadChildren: () => import('../color/color.module').then(m => m.ColorModule)
      }, {
        path: 'me', loadChildren: () => import('../me/me.module').then(m => m.MeModule)
      }, {
        path: 'events', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
      }, {
        path: 'invoices', loadChildren: () => import('../invoice/invoice.module').then(m => m.InvoiceModule)
      }, {
        path: 'notes', loadChildren: () => import('../note/note.module').then(m => m.NoteModule)
      },
      { path: 'shortcut', loadChildren: () => import('../shortcut/shortcut.module').then(m => m.ShortcutModule) },
      { path: 'accounts', loadChildren: () => import('../account/account.module').then(m => m.AccountModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavRoutingModule {
}
