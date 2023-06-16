import { NgModule } from '@angular/core';
import { ColorComponent } from './color.component';
import { ColorDetailComponent } from './detail/color-detail.component';
import { ColorListComponent } from './list/color-list.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorRoutingModule } from './color-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { EffectsModule } from '@ngrx/effects';
import { ColorEffects } from '../store/effects/color.effects';
import { ColorService } from '../services/color.service';


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
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
