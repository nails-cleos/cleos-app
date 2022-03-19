import { NgModule } from '@angular/core';

import { AdditionalRoutingModule } from './additional-routing.module';
import { AdditionalComponent } from './additional.component';
import { AdditionalListComponent } from './list/additional-list.component';
import { AdditionalDetailComponent } from './detail/additional-detail.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { AdditionalEffects } from '../store/effects/additional.effects';
import { AdditionalService } from '../services/additional.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

@NgModule({
  declarations: [
    AdditionalComponent,
    AdditionalListComponent,
    AdditionalDetailComponent
  ],
  imports: [
    AdditionalRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('additional')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([AdditionalEffects])
  ],
  providers: [
    AdditionalService
  ]
})
export class AdditionalModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
