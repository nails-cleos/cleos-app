import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { MainRoutingModule } from './main-routing.module';
import { MatCarouselModule } from '@magloft/material-carousel';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EffectsModule } from '@ngrx/effects';

import { MainComponent } from './main.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MiniCardTreatmentComponent } from './mini-card-treatment/mini-card-treatment.component';
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

@NgModule({
  declarations: [
    ImageViewerComponent,
    MainComponent,
    MainContentComponent,
    CatalogComponent,
    PrivacyComponent,
    TermsAndConditionsComponent,
    MiniCardTreatmentComponent
  ],
  imports: [
    MainRoutingModule,
    SharedModule,
    MatSlideToggleModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('main')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([MainEffects, CatalogueEffects, UserEffects, LoginEffects]),
    MatCarouselModule.forRoot()
  ],
  providers: [
    MainService,
    CatalogueService,
    TreatmentService,
    UserService,
    AuthService
  ]
})
export class MainModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
