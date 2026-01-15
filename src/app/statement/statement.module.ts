import { NgModule } from '@angular/core';
import { StatementRoutingModule } from './statement-routing.module';
import { StatementComponent } from './statement.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideEffects } from '@ngrx/effects';
import { OfficeService } from '../services/office.service';
import { provideState, Store } from '@ngrx/store';
import { StatementNavigationEffects } from './statement-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { STATEMENT_FEATURE_KEY, statementReducer } from '../store/reducers/statement.reducers';
import { StatementEffects } from '../store/effects/statement.effects';
import { StatementService } from '../services/statement.service';

@NgModule({
  imports: [
    StatementComponent,
    StatementRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('statement'),
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
    StatementService,
    OfficeService,
    provideState(STATEMENT_FEATURE_KEY, statementReducer),
    provideEffects(StatementEffects, StatementNavigationEffects),
  ],
})
export class StatementModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
