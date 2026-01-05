import { NgModule } from '@angular/core';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideEffects } from '@ngrx/effects';
import { InvoiceEffects } from '../store/effects/invoice.effects';
import { InvoiceService } from '../services/invoice.service';
import { OfficeService } from '../services/office.service';
import { provideState, Store } from '@ngrx/store';
import { InvoiceNavigationEffects } from './invoice-navigation.effects';
import { INVOICE_FEATURE_KEY, invoiceReducer } from '../store/reducers/invoice.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    InvoiceComponent,
    InvoiceRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('invoice'),
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
    InvoiceService,
    OfficeService,
    provideState(INVOICE_FEATURE_KEY, invoiceReducer),
    provideEffects(InvoiceEffects, InvoiceNavigationEffects),
  ],
})
export class InvoiceModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      translateService.currentLang = '';
      this.translateService.use(language);
    });
  }
}
