import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { UnavailableRoutingModule } from './unavailable-routing.module';

import { UnavailableComponent } from './unavailable.component';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { EffectsModule } from '@ngrx/effects';
import { UnavailableEffects } from '../store/effects/unavailable.effects';
import { UnavailableService } from '../services/unavailable.service';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { BlockAgendaComponent } from './block-agenda/block-agenda.component';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';

@NgModule({
  declarations: [
    UnavailableComponent,
    UnavailableListComponent,
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
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
