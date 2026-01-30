import { NgModule } from '@angular/core';

import { CurrencyRoutingModule } from './currency-routing.module';
import { CurrencyComponent } from './currency.component';
import { CurrencyListComponent } from './list/currency-list.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideEffects } from '@ngrx/effects';
import { CurrencyEffects } from '../store/effects/currency.effects';
import { CurrencyService } from '../services/currency.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideState, Store } from '@ngrx/store';
import { CurrencyNavigationEffects } from './currency-navigation.effects';
import { CURRENCY_FEATURE_KEY, currencyReducer } from '../store/reducers/currency.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    CurrencyComponent,
    CurrencyListComponent,
    CurrencyRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('currency'),
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true,
    }),
  ],
  providers: [
    CurrencyService,
    provideState(CURRENCY_FEATURE_KEY, currencyReducer),
    provideEffects(CurrencyEffects, CurrencyNavigationEffects),
  ],
})
export class CurrencyModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
