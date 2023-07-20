import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { EffectsModule } from '@ngrx/effects';
import { InvoiceEffects } from '../store/effects/invoice.effects';
import { InvoiceService } from '../services/invoice.service';
import { OfficeService } from '../services/office.service';

@NgModule({
  declarations: [
    InvoiceComponent
  ],
  imports: [
    InvoiceRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('invoice')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([InvoiceEffects])
  ],
  providers: [
    InvoiceService,
    OfficeService
  ]
})
export class InvoiceModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
