import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { CatalogueRoutingModule } from './catalogue-routing.module';
import { DragDropDirective } from '../directives/drag-drop.directive';

import { CatalogueComponent } from './catalogue.component';
import { CataloguesComponent } from './list/catalogues.component';
import { CatalogueDetailComponent } from './detail/catalogue-detail.component';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EffectsModule } from '@ngrx/effects';
import { CatalogueEffects } from '../store/effects/catalogue.effects';
import { CatalogueService } from '../services/catalogue.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

@NgModule({
  declarations: [
    CatalogueComponent,
    CataloguesComponent,
    CatalogueDetailComponent,
    DragDropDirective
  ],
  imports: [
    CatalogueRoutingModule,
    SharedModule,
    MatProgressBarModule,
    DragDropModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('catalogue')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([CatalogueEffects])
  ],
  providers: [
    CatalogueService
  ]
})
export class CatalogueModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
