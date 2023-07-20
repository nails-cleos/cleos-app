import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { DiscountRoutingModule } from './discount-routing.module';

import { DiscountComponent } from './discount.component';
import { DiscountDialogComponent, DiscountsComponent } from './list/discounts.component';
import { DiscountDetailComponent } from './detail/discount-detail.component';
import { EffectsModule } from '@ngrx/effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { DiscountService } from '../services/discount.service';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { CurrencyService } from '../services/currency.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';

@NgModule({
  declarations: [
    DiscountComponent,
    DiscountsComponent,
    DiscountDetailComponent,
    DiscountDialogComponent
  ],
  imports: [
    DiscountRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('discount')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([DiscountEffects, UserEffects])
  ],
  providers: [
    DiscountService,
    UserService,
    CurrencyService
  ]
})
export class DiscountModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
