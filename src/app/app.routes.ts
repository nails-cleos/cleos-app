import { Routes } from '@angular/router';
import { DEFAULT_LOCALE } from './util/dates';

export const routes: Routes = [
  {
    path: ':lang',
    loadChildren: () => import('./nav/nav.routes').then(m => m.NAV_ROUTES),
  },
  { path: '**', redirectTo: `/${DEFAULT_LOCALE}`, pathMatch: 'full' },
];
