import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppMaterialModule } from '../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../util/SharedModule';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { ActivateAccountComponent } from '../activate-account/activate-account.component';
import { RecoveryPasswordComponent } from '../recovery-password/recovery-password.component';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { SignInComponent } from '../sign-in/sign-in.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ProfileComponent } from '../profile/profile.component';

@NgModule({
  declarations: [
    AuthComponent,
    SignUpComponent,
    SignInComponent,
    ActivateAccountComponent,
    RecoveryPasswordComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ProfileComponent
  ],
  imports: [
    AuthRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatPasswordStrengthModule.forRoot(),
    AppMaterialModule
  ]
})
export class AuthModule {
}
