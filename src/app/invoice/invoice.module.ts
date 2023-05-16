import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { EffectsModule } from '@ngrx/effects';
import { InvoiceEffects } from '../store/effects/invoice.effects';
import { InvoiceService } from '../services/invoice.service';
import { MatChipsModule } from '@angular/material/chips';
import { OfficeService } from '../services/office.service';

@NgModule({
  declarations: [
    InvoiceComponent
  ],
  imports: [
    InvoiceRoutingModule,
    SharedModule,
    MatChipsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('invoice')
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
