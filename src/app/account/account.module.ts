import { NgModule } from '@angular/core';
import { AccountComponent } from './account/account.component';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { EffectsModule } from '@ngrx/effects';
import { AccountService } from '../services/account.service';
import { AccountEffects } from '../store/effects/account.effects';
import { TransactionComponent } from './transaction/transaction.component';
import { BalanceComponent } from './balance/balance.component';
import { TransactionViewComponent } from './transaction/view/transaction-view.component';
import { PaymentService } from '../services/payment.service';
import { TransactionDetailComponent } from './transaction/detail/transaction-detail.component';
import { PaymentEffects } from '../store/effects/payment.effects';

@NgModule({
  declarations: [
    AccountComponent,
    TransactionComponent,
    BalanceComponent,
    TransactionViewComponent,
    TransactionDetailComponent
  ],
  imports: [
    AccountRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('account')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([AccountEffects, PaymentEffects])
  ],
  providers: [
    AccountService,
    PaymentService
  ]
})
export class AccountModule {

  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
