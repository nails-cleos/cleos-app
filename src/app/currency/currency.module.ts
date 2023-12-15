import { NgModule } from '@angular/core';

import { CurrencyRoutingModule } from './currency-routing.module';
import { CurrencyComponent } from './currency.component';
import { SharedModule } from '../shared/shared.module';
import { CurrencyListComponent } from './list/currency-list.component';
import { CurrencyDetailComponent } from './detail/currency-detail.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { CurrencyEffects } from '../store/effects/currency.effects';
import { CurrencyService } from '../services/currency.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';

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
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
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
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
