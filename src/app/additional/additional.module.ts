import { NgModule } from '@angular/core';

import { AdditionalRoutingModule } from './additional-routing.module';
import { AdditionalComponent } from './additional.component';
import { AdditionalListComponent } from './list/additional-list.component';
import { AdditionalDetailComponent } from './detail/additional-detail.component';
import { SharedModule } from '../shared/shared.module';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { AdditionalEffects } from '../store/effects/additional.effects';
import { AdditionalService } from '../services/additional.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentService } from '../services/treatment.service';
import { AdditionalSortingComponent } from './sorting/additional-sorting.component';
import { DragDropSortingComponent } from '../util/drag-drop-sorting/drag-drop-sorting.component';

@NgModule({
  declarations: [
    AdditionalComponent,
    AdditionalListComponent,
    AdditionalDetailComponent,
    AdditionalSortingComponent
  ],
  imports: [
    AdditionalRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('additional')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([AdditionalEffects]),
    DragDropSortingComponent
  ],
  providers: [
    AdditionalService,
    TreatmentService
  ]
})
export class AdditionalModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
