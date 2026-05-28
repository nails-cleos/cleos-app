import { Routes } from '@angular/router';
import { TranslationLoaderResolver } from './util/translation.resolver';

export const routes: Routes = [
  {
    path: ':lang',
    loadChildren: () => import('./nav/nav.routes').then(m => m.NAV_ROUTES),
    resolve: { i18n: TranslationLoaderResolver },
  },
  { path: '**', redirectTo: '/en-GB', pathMatch: 'full' },
];
