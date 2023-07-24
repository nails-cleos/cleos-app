import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { UnavailableRoutingModule } from './unavailable-routing.module';

import { UnavailableComponent } from './unavailable.component';
import { UnavailableDetailComponent } from './detail/unavailable-detail.component';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { EffectsModule } from '@ngrx/effects';
import { UnavailableEffects } from '../store/effects/unavailable.effects';
import { UnavailableService } from '../services/unavailable.service';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { BlockAgendaComponent } from './block-agenda/block-agenda.component';

@NgModule({
  declarations: [
    UnavailableComponent,
    UnavailableListComponent,
    UnavailableDetailComponent,
    BlockAgendaComponent
  ],
  imports: [
    UnavailableRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('unavailable')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([UnavailableEffects])
  ],
  providers: [
    UnavailableService,
    UserService
  ]
})
export class UnavailableModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
