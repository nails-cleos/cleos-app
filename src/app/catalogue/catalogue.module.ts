import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogueRoutingModule } from './catalogue-routing.module';

import { CatalogueComponent } from './catalogue.component';
import { CataloguesComponent } from './list/catalogues.component';
import { provideEffects } from '@ngrx/effects';
import { CatalogueEffects } from '../store/effects/catalogue.effects';
import { CatalogueService } from '../services/catalogue.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentService } from '../services/treatment.service';
import { provideState, Store } from '@ngrx/store';
import { CatalogueNavigationEffects } from './catalogue-navigation.effects';
import { CATALOGUE_FEATURE_KEY, catalogueReducer } from '../store/reducers/catalogue.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    CatalogueComponent,
    CataloguesComponent,
    CatalogueRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('catalogue'),
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
    CatalogueService,
    TreatmentService,
    provideState(CATALOGUE_FEATURE_KEY, catalogueReducer),
    provideEffects(CatalogueEffects, CatalogueNavigationEffects),
  ],
})
export class CatalogueModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
