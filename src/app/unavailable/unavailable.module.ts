import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { UnavailableRoutingModule } from './unavailable-routing.module';

import { UnavailableComponent } from './unavailable.component';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { provideEffects } from '@ngrx/effects';
import { UnavailableEffects } from '../store/effects/unavailable.effects';
import { UnavailableService } from '../services/unavailable.service';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { BlockAgendaComponent } from './block-agenda/block-agenda.component';
import { provideState, Store } from '@ngrx/store';
import { UnavailableNavigationEffects } from './unavailable-navigation.effects';
import { UNAVAILABLE_FEATURE_KEY, unavailableReducer } from '../store/reducers/unavailable.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    UnavailableComponent,
    UnavailableListComponent,
    BlockAgendaComponent,
    UnavailableRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('unavailable'),
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
    UnavailableService,
    UserService,
    provideState(UNAVAILABLE_FEATURE_KEY, unavailableReducer),
    provideEffects(UnavailableEffects, UnavailableNavigationEffects),
  ],
})
export class UnavailableModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      translateService.currentLang = '';
      this.translateService.use(language);
    });
  }
}
