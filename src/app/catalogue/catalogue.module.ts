import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { CatalogueRoutingModule } from './catalogue-routing.module';
import { DragDropDirective } from '../directives/drag-drop.directive';

import { CatalogueComponent } from './catalogue.component';
import { CataloguesComponent } from './list/catalogues.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EffectsModule } from '@ngrx/effects';
import { CatalogueEffects } from '../store/effects/catalogue.effects';
import { CatalogueService } from '../services/catalogue.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { TreatmentService } from '../services/treatment.service';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';

@NgModule({
  declarations: [
    CatalogueComponent,
    CataloguesComponent,
    DragDropDirective
  ],
  imports: [
    CatalogueRoutingModule,
    SharedModule,
    MatProgressBarModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('catalogue')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([CatalogueEffects])
  ],
  providers: [
    CatalogueService,
    TreatmentService
  ]
})
export class CatalogueModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
