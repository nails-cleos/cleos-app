import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TranslationLoaderResolver } from './util/translation.resolver';

const routes: Routes = [
  { path: ':lang', loadChildren: () => import('./nav/nav.module').then(m => m.NavModule) },
  { path: '**', redirectTo: '/en-GB', pathMatch: 'full', resolve: { model: TranslationLoaderResolver } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled', preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
