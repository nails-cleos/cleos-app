import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { UsersComponent } from './list/users.component';
import { OverviewComponent } from './overview/overview.component';
import { OverviewChartComponent } from './overview/chart/overview-chart/overview-chart.component';
import { provideEffects } from '@ngrx/effects';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideState, Store } from '@ngrx/store';
import { SelectUserDialogComponent } from './list/select-user-dialog.component';
import { USER_FEATURE_KEY, userReducer } from '../store/reducers/user.reducers';
import { UserNavigationEffects } from './user-navigation.effects';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { I18NState } from '../store/reducers/i18n.reducers';

@NgModule({
  imports: [
    UserComponent,
    UsersComponent,
    OverviewComponent,
    OverviewChartComponent,
    SelectUserDialogComponent,
    UserRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('user'),
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
    UserService,
    provideState(USER_FEATURE_KEY, userReducer),
    provideEffects(UserEffects, UserNavigationEffects),
  ],
})
export class UserModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
