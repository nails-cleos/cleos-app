import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { TreatmentRoutingModule } from './treatment-routing.module';

import { TreatmentComponent } from './treatment.component';
import { TreatmentsComponent } from './list/treatments.component';
import { TreatmentDetailComponent } from './detail/treatment-detail.component';
import { MatTabsModule } from '@angular/material/tabs';
import { EffectsModule } from '@ngrx/effects';
import { TreatmentEffects } from '../store/effects/treatment.effects';
import { TreatmentService } from '../services/treatment.service';
import { TreatmentViewComponent } from './view/treatment-view.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { TreatmentTableComponent } from './table/treatment-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';
import { DragDropSortingComponent } from '../util/drag-drop-sorting/drag-drop-sorting.component';

@NgModule({
  declarations: [
    TreatmentComponent,
    TreatmentsComponent,
    TreatmentDetailComponent,
    TreatmentViewComponent,
    TreatmentTableComponent,
    TreatmentSortingComponent
  ],
  imports: [
    TreatmentRoutingModule,
    SharedModule,
    MatTabsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('treatment')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([TreatmentEffects]),
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    DragDropSortingComponent
  ],
  providers: [
    TreatmentService
  ]
})
export class TreatmentModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
