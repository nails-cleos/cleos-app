import { NgModule } from '@angular/core';

import { OfficeRoutingModule } from './office-routing.module';
import { OfficeComponent } from './office.component';
import { OfficeListComponent } from './list/office-list.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideEffects } from '@ngrx/effects';
import { OfficeEffects } from '../store/effects/office.effects';
import { OfficeService } from '../services/office.service';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideState, Store } from '@ngrx/store';
import { OFFICE_FEATURE_KEY, officeReducer } from '../store/reducers/office.reducers';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { OfficeNavigationEffects } from './office-navigation.effects';

@NgModule({
  imports: [
    OfficeComponent,
    OfficeListComponent,
    OfficeRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('office'),
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
    OfficeService,
    UserService,
    provideState(OFFICE_FEATURE_KEY, officeReducer),
    provideEffects(OfficeEffects, OfficeNavigationEffects),
  ],
})
export class OfficeModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      translateService.currentLang = '';
      this.translateService.use(language);
    });
  }
}
