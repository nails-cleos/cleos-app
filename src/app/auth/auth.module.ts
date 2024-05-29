import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { EffectsModule } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { AuthService } from '../services/auth.service';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { FirebaseUIModule } from 'firebaseui-angular';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';
import { NgxColorsModule } from 'ngx-colors';


@NgModule({
  declarations: [
    AuthComponent,
    ForgotPasswordComponent,
    ProfileComponent,
    RedirectComponent
  ],
  imports: [
    AuthRoutingModule,
    SharedModule,
    MatSlideToggleModule,
    NgxMatIntlTelInputComponent,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('auth')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([LoginEffects, UserEffects]),
    FirebaseUIModule,
    NgxColorsModule
  ],
  providers: [
    AuthService,
    UserService,
    TokenService
  ]
})
export class AuthModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
