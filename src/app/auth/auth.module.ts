import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';

import { AppMaterialModule } from '../util/app-material.module';
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
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatPasswordStrengthModule.forRoot(),
    AppMaterialModule,
    MatTabsModule,
    MatSlideToggleModule,
    NgxMatIntlTelInputModule
  ]
})
export class AuthModule {
}
