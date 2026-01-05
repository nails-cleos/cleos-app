import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreatmentRoutingModule } from './treatment-routing.module';

import { TreatmentComponent } from './treatment.component';
import { TreatmentsComponent } from './list/treatments.component';
import { provideEffects } from '@ngrx/effects';
import { TreatmentEffects } from '../store/effects/treatment.effects';
import { TreatmentService } from '../services/treatment.service';
import { TreatmentViewComponent } from './view/treatment-view.component';
import { TreatmentTableComponent } from './table/treatment-table.component';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentGroupSortingComponent } from './sorting/treatment-group-sorting.component';
import { DragDropSortingComponent } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { ColorService } from '../services/color.service';
import { provideState, Store } from '@ngrx/store';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';
import { TreatmentNavigationEffects } from './treatment-navigation.effects';
import { TREATMENT_FEATURE_KEY, treatmentReducer } from '../store/reducers/treatment.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  declarations: [],
  imports: [
    TreatmentComponent,
    TreatmentsComponent,
    TreatmentViewComponent,
    TreatmentTableComponent,
    TreatmentGroupSortingComponent,
    TreatmentSortingComponent,
    DragDropSortingComponent,
    TreatmentRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('treatment'),
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
    TreatmentService,
    ColorService,
    provideState(TREATMENT_FEATURE_KEY, treatmentReducer),
    provideEffects(TreatmentEffects, TreatmentNavigationEffects),
  ],
})
export class TreatmentModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      translateService.currentLang = '';
      this.translateService.use(language);
    });
  }
}
