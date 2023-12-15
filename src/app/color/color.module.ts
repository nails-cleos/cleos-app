import { NgModule } from '@angular/core';
import { ColorComponent } from './color.component';
import { ColorDetailComponent } from './detail/color-detail.component';
import { ColorListComponent } from './list/color-list.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorRoutingModule } from './color-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { EffectsModule } from '@ngrx/effects';
import { ColorEffects } from '../store/effects/color.effects';
import { ColorService } from '../services/color.service';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';


@NgModule({
  declarations: [
    ColorComponent,
    ColorListComponent,
    ColorDetailComponent
  ],
  imports: [
    ColorRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('color')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([ColorEffects])
  ],
  providers: [
    ColorService
  ]
})
export class ColorModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
