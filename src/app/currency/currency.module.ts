import { NgModule } from '@angular/core';

import { CurrencyRoutingModule } from './currency-routing.module';
import { CurrencyComponent } from './currency.component';
import { SharedModule } from '../shared/shared.module';
import { CurrencyListComponent } from './list/currency-list.component';
import { CurrencyDetailComponent } from './detail/currency-detail.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { CurrencyEffects } from '../store/effects/currency.effects';
import { CurrencyService } from '../services/currency.service';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/currency/', '.json');

@NgModule({
  declarations: [
    CurrencyComponent,
    CurrencyListComponent,
    CurrencyDetailComponent
  ],
  imports: [
    CurrencyRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([CurrencyEffects])
  ],
  providers: [
    CurrencyService
  ]
})
export class CurrencyModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
