import { NgModule } from '@angular/core';

import { CurrencyRoutingModule } from './currency-routing.module';
import { CurrencyComponent } from './currency.component';
import { SharedModule } from '../shared/shared.module';
import { CurrencyListComponent } from './list/currency-list.component';
import { CurrencyDetailComponent } from './detail/currency-detail.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { CurrencyEffects } from '../store/effects/currency.effects';
import { CurrencyService } from '../services/currency.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

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
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('currency')
      },
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
