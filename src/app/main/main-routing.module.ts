import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MainTreatmentComponent } from './treatment/main-treatment.component';

const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: '', component: MainContentComponent },
      { path: 'catalogs', component: CatalogComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'term-and-conditions', component: TermsAndConditionsComponent },
      { path: ':id/treatment', component: MainTreatmentComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {
}
