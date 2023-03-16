import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslationLoaderResolver } from './util/translation.resolver';

const routes: Routes = [
  { path: 'main', loadChildren: () => import('./main/main.module').then(m => m.MainModule) },
  { path: '', loadChildren: () => import('./nav/nav.module').then(m => m.NavModule) },
  { path: '**', redirectTo: '/main', pathMatch: 'full', resolve: { model: TranslationLoaderResolver } }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
