import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

import { UserComponent } from './user.component';
import { UsersComponent } from './list/users.component';
import { UserDetailComponent } from './detail/user-detail.component';
import { OverviewComponent } from './overview/overview.component';
import { OverviewChartComponent } from './overview/chart/overview-chart/overview-chart.component';
import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { NgxMatColorPickerModule } from '@angular-material-components/color-picker';

@NgModule({
  declarations: [
    UserComponent,
    UsersComponent,
    UserDetailComponent,
    OverviewComponent,
    OverviewChartComponent
  ],
  imports: [
    UserRoutingModule,
    SharedModule,
    NgxMatIntlTelInputModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('user')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([UserEffects]),
    NgxMatColorPickerModule
  ],
  providers: [
    UserService
  ]
})
export class UserModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
