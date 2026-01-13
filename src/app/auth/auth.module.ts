import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';
import { provideEffects } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { AuthService } from '../services/auth.service';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideState, Store } from '@ngrx/store';
import { AUTH_FEATURE_KEY, authReducer } from '../store/reducers/auth.reducers';
import { AuthNavigationEffects } from './auth-navigation.effects';
import { USER_FEATURE_KEY, userReducer } from '../store/reducers/user.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { I18NState } from '../store/reducers/i18n.reducers';


@NgModule({
  imports: [
    AuthComponent,
    ForgotPasswordComponent,
    ProfileComponent,
    RedirectComponent,
    AuthRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('auth'),
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
    AuthService,
    UserService,
    provideState(AUTH_FEATURE_KEY, authReducer),
    provideState(USER_FEATURE_KEY, userReducer),
    provideEffects(LoginEffects, UserEffects, AuthNavigationEffects),
  ],
})
export class AuthModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      this.translateService.use(language);
    });
  }
}
