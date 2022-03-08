import { NgModule } from '@angular/core';

import { OfficeRoutingModule } from './office-routing.module';
import { OfficeComponent } from './office.component';
import { SharedModule } from '../shared/shared.module';
import { OfficeListComponent } from './list/office-list.component';
import { OfficeDetailComponent } from './detail/office-detail.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { OfficeEffects } from '../store/effects/office.effects';
import { OfficeService } from '../services/office.service';
import { UserService } from '../services/user.service';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/office/', '.json');

@NgModule({
  declarations: [
    OfficeComponent,
    OfficeListComponent,
    OfficeDetailComponent
  ],
  imports: [
    OfficeRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([OfficeEffects])
  ],
  providers: [
    OfficeService,
    UserService
  ]
})
export class OfficeModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
