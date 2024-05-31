import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

import { UserComponent } from './user.component';
import { SelectUserDialogComponent, UsersComponent } from './list/users.component';
import { OverviewComponent } from './overview/overview.component';
import { OverviewChartComponent } from './overview/chart/overview-chart/overview-chart.component';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';
import { NgxColorsModule } from 'ngx-colors';

@NgModule({
  declarations: [
    UserComponent,
    UsersComponent,
    OverviewComponent,
    OverviewChartComponent,
    SelectUserDialogComponent
  ],
  imports: [
    UserRoutingModule,
    SharedModule,
    NgxMatIntlTelInputComponent,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('user')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([UserEffects]),
    NgxColorsModule
  ],
  providers: [
    UserService
  ]
})
export class UserModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
