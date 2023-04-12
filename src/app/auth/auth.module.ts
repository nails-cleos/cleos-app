import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

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
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { EffectsModule } from '@ngrx/effects';
import { LoginEffects } from '../store/effects/auth.effects';
import { AuthService } from '../services/auth.service';
import { UserEffects } from '../store/effects/user.effects';
import { UserService } from '../services/user.service';
import { TokenService } from '../services/token.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { NgxMatColorPickerModule } from '@angular-material-components/color-picker';
import { GoogleSigninButtonModule } from "@abacritt/angularx-social-login";


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
        MatTabsModule,
        MatSlideToggleModule,
        NgxMatIntlTelInputComponent,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useClass: TranslateLoaderFactory.forModule('auth')
            },
            isolate: false,
            extend: true
        }),
        EffectsModule.forFeature([LoginEffects, UserEffects]),
        NgxMatColorPickerModule,
        GoogleSigninButtonModule
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
