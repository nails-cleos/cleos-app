import { NgModule } from '@angular/core';
import { DocumentRoutingModule } from './document-routing.module';
import { DocumentComponent } from './document.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideEffects } from '@ngrx/effects';
import { OfficeService } from '../services/office.service';
import { provideState, Store } from '@ngrx/store';
import { DocumentNavigationEffects } from './document-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { DOCUMENT_FEATURE_KEY, documentReducer } from '../store/reducers/document.reducers';
import { DocumentEffects } from '../store/effects/document.effects';
import { DocumentService } from '../services/document.service';

@NgModule({
  imports: [
    DocumentComponent,
    DocumentRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('document'),
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
    DocumentService,
    OfficeService,
    provideState(DOCUMENT_FEATURE_KEY, documentReducer),
    provideEffects(DocumentEffects, DocumentNavigationEffects),
  ],
})
export class DocumentModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
