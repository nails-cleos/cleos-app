import { NgModule } from '@angular/core';

import { OfficeRoutingModule } from './office-routing.module';
import { OfficeComponent } from './office.component';
import { SharedModule } from '../shared/shared.module';
import { OfficeListComponent } from './list/office-list.component';
import { OfficeDetailComponent } from './detail/office-detail.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { OfficeEffects } from '../store/effects/office.effects';
import { OfficeService } from '../services/office.service';
import { UserService } from '../services/user.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

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
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('office')
      },
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
