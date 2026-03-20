import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MainRoutingModule } from './main-routing.module';
import { provideEffects } from '@ngrx/effects';
import { MainComponent } from './main.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MainEffects } from '../store/effects/main.effects';
import { MainService } from '../services/main.service';
import { CatalogueService } from '../services/catalogue.service';
import { TreatmentService } from '../services/treatment.service';
import { CatalogueEffects } from '../store/effects/catalogue.effects';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { LoginEffects } from '../store/effects/auth.effects';
import { AuthService } from '../services/auth.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { provideState, Store } from '@ngrx/store';
import { BottomSheetBookAppointmentComponent } from './main-content/bottom-sheet-book-appointment';
import { MAIN_FEATURE_KEY, mainReducer } from '../store/reducers/main.reducers';
import { MainNavigationEffects } from './main-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { FaqComponent } from './faq/faq.component';

@NgModule({
  imports: [
    MainComponent,
    MainContentComponent,
    CatalogComponent,
    FaqComponent,
    PrivacyComponent,
    TermsAndConditionsComponent,
    BottomSheetBookAppointmentComponent,
    MainRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('main'),
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
    MainService,
    CatalogueService,
    TreatmentService,
    UserService,
    AuthService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    provideState(MAIN_FEATURE_KEY, mainReducer),
    provideEffects(MainEffects, CatalogueEffects, UserEffects, LoginEffects, MainNavigationEffects),
  ],
})
export class MainModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
