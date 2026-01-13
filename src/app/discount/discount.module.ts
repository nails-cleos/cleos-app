import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { DiscountRoutingModule } from './discount-routing.module';

import { DiscountComponent } from './discount.component';
import { DiscountsComponent } from './list/discounts.component';
import { DiscountDialogComponent } from './list/discount-dialog.component';
import { provideEffects } from '@ngrx/effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { DiscountService } from '../services/discount.service';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { CurrencyService } from '../services/currency.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideState, Store } from '@ngrx/store';
import { DISCOUNT_FEATURE_KEY, discountReducer } from '../store/reducers/discount.reducers';
import { DiscountNavigationEffects } from './discount-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    DiscountComponent,
    DiscountsComponent,
    DiscountDialogComponent,
    DiscountRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('discount'),
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
    DiscountService,
    UserService,
    CurrencyService,
    provideState(DISCOUNT_FEATURE_KEY, discountReducer),
    provideEffects(DiscountEffects, UserEffects, DiscountNavigationEffects),
  ],
})
export class DiscountModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
