import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { UnavailableRoutingModule } from './unavailable-routing.module';

import { UnavailableComponent } from './unavailable.component';
import { UnavailableDetailComponent } from './detail/unavailable-detail.component';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { UnavailableEffects } from '../store/effects/unavailable.effects';
import { UnavailableService } from '../services/unavailable.service';
import { UserService } from '../services/user.service';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/unavailable/', '.json');

@NgModule({
  declarations: [
    UnavailableComponent,
    UnavailableListComponent,
    UnavailableDetailComponent
  ],
  imports: [
    UnavailableRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
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
