import { NgModule } from '@angular/core';
import { AccountComponent } from './account/account.component';
import { AccountRoutingModule } from './account-routing.module';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideEffects } from '@ngrx/effects';
import { AccountService } from '../services/account.service';
import { AccountEffects } from '../store/effects/account.effects';
import { TransactionComponent } from './transaction/transaction.component';
import { BalanceComponent } from './balance/balance.component';
import { TransactionViewComponent } from './transaction/view/transaction-view.component';
import { PaymentService } from '../services/payment.service';
import { TransactionDetailComponent } from './transaction/detail/transaction-detail.component';
import { PaymentEffects } from '../store/effects/payment.effects';
import { provideState, Store } from '@ngrx/store';
import { AccountNavigationEffects } from './account-navigation.effects';
import { ACCOUNT_FEATURE_KEY, accountReducer } from '../store/reducers/account.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    AccountComponent,
    BalanceComponent,
    TransactionComponent,
    TransactionViewComponent,
    TransactionDetailComponent,
    AccountRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('account'),
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
    AccountService,
    PaymentService,
    provideState(ACCOUNT_FEATURE_KEY, accountReducer),
    provideEffects(AccountEffects, PaymentEffects, AccountNavigationEffects),
  ],
})
export class AccountModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
