import { Routes } from '@angular/router';
import { TranslationLoaderResolver } from './util/translation.resolver';
import { DEFAULT_LOCALE } from './util/dates';

export const routes: Routes = [
  {
    path: ':lang',
    loadChildren: () => import('./nav/nav.routes').then(m => m.NAV_ROUTES),
    resolve: { i18n: TranslationLoaderResolver },
  },
  { path: '**', redirectTo: `/${DEFAULT_LOCALE}`, pathMatch: 'full' },
];
