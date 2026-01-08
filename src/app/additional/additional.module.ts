import { NgModule } from '@angular/core';

import { AdditionalRoutingModule } from './additional-routing.module';
import { AdditionalComponent } from './additional.component';
import { AdditionalListComponent } from './list/additional-list.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideEffects } from '@ngrx/effects';
import { AdditionalEffects } from '../store/effects/additional.effects';
import { AdditionalService } from '../services/additional.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentService } from '../services/treatment.service';
import { AdditionalSortingComponent } from './sorting/additional-sorting.component';
import { DragDropSortingComponent } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { provideState, Store } from '@ngrx/store';
import { AdditionalNavigationEffects } from './additional-navigation.effects';
import { ADDITIONAL_FEATURE_KEY, additionalReducer } from '../store/reducers/additional.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    AdditionalComponent,
    AdditionalListComponent,
    AdditionalSortingComponent,
    DragDropSortingComponent,
    AdditionalRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('additional'),
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
    AdditionalService,
    TreatmentService,
    provideState(ADDITIONAL_FEATURE_KEY, additionalReducer),
    provideEffects(AdditionalEffects, AdditionalNavigationEffects),
  ],
})
export class AdditionalModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
