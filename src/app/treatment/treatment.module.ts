import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { TreatmentRoutingModule } from './treatment-routing.module';

import { TreatmentComponent } from './treatment.component';
import { TreatmentsComponent } from './list/treatments.component';
import { EffectsModule } from '@ngrx/effects';
import { TreatmentEffects } from '../store/effects/treatment.effects';
import { TreatmentService } from '../services/treatment.service';
import { TreatmentViewComponent } from './view/treatment-view.component';
import { TreatmentTableComponent } from './table/treatment-table.component';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';
import { DragDropSortingComponent } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { ColorService } from '../services/color.service';

@NgModule({
  declarations: [
    TreatmentComponent,
    TreatmentsComponent,
    TreatmentViewComponent,
    TreatmentTableComponent,
    TreatmentSortingComponent
  ],
  imports: [
    TreatmentRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('treatment')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([TreatmentEffects]),
    DragDropSortingComponent
  ],
  providers: [
    TreatmentService,
    ColorService
  ]
})
export class TreatmentModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
