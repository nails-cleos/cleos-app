import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';

import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

import { AuthComponent } from './auth.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';
import { EffectsModule } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { AuthService } from '../services/auth.service';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { Observable, concat, from } from 'rxjs';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

export class LazyTranslateLoader2 implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const match = lang.match(/([-_])/);
    const currentLang = !match ? lang : lang.substr(0, match.index);

    const c = concat(
      import(`../../assets/i18n/${currentLang}.json`));
    const d = concat(
      import(`../../assets/i18n/auth/${currentLang}.json`));

    // return forkJoin(a, b);
    return from(import(`../../assets/i18n/auth/${currentLang}.json`));
    // return merge(import(`../../assets/i18n/auth/${url}.json`), import(`../../assets/i18n/${url}.json`));
  }
}


@NgModule({
  declarations: [
    AuthComponent,
    SignUpComponent,
    SignInComponent,
    ActivateAccountComponent,
    RecoveryPasswordComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ProfileComponent,
    RedirectComponent
  ],
  imports: [
    AuthRoutingModule,
    SharedModule,
    MatPasswordStrengthModule.forRoot(),
    MatTabsModule,
    MatSlideToggleModule,
    NgxMatIntlTelInputModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('auth')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([LoginEffects, UserEffects])
  ],
  providers: [
    AuthService,
    UserService,
    TokenService
  ]
})
export class AuthModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
