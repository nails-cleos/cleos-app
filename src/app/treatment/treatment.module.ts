import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreatmentRoutingModule } from './treatment-routing.module';

import { TreatmentComponent } from './treatment.component';
import { TreatmentsComponent } from './list/treatments.component';
import { EffectsModule } from '@ngrx/effects';
import { TreatmentEffects } from '../store/effects/treatment.effects';
import { TreatmentService } from '../services/treatment.service';
import { TreatmentViewComponent } from './view/treatment-view.component';
import { TreatmentTableComponent } from './table/treatment-table.component';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentGroupSortingComponent } from './sorting/treatment-group-sorting.component';
import { DragDropSortingComponent } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { ColorService } from '../services/color.service';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';

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
    EffectsModule.forFeature([TreatmentEffects]),
  ],
  providers: [
    TreatmentService,
    ColorService,
  ],
})
export class TreatmentModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe((state) => {
      translateService.currentLang = '';
      this.translateService.use(state.language);
    });
  }
}
