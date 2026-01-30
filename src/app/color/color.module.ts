import { NgModule } from '@angular/core';
import { ColorComponent } from './color.component';
import { ColorListComponent } from './list/color-list.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorRoutingModule } from './color-routing.module';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideEffects } from '@ngrx/effects';
import { ColorEffects } from '../store/effects/color.effects';
import { ColorService } from '../services/color.service';
import { provideState, Store } from '@ngrx/store';
import { COLOR_FEATURE_KEY, colorReducer } from '../store/reducers/color.reducers';
import { ColorNavigationEffects } from './color-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    ColorComponent,
    ColorListComponent,
    ColorRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('color'),
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
    ColorService,
    provideState(COLOR_FEATURE_KEY, colorReducer),
    provideEffects(ColorEffects, ColorNavigationEffects),
  ],
})
export class ColorModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
