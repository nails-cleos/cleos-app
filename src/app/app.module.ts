// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from './util/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SocialLoginModule } from 'angularx-social-login';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// Providers
import { httpInterceptorProviders } from './http-interceptors';
import { GoogleLoginProvider, FacebookLoginProvider, SocialAuthServiceConfig } from 'angularx-social-login';
import { environment } from '../environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';

// Services
import { AuthGuardService } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

// Reducers
import { reducers } from './store/app.states';

// Effects
import { LoginEffects } from './store/effects/auth.effects';
import { UserEffects } from './store/effects/user.effects';

// Components
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DialogComponent } from './dialog/dialog.component';

export function getAuthServiceConfigs(): SocialAuthServiceConfig {
  return {
    autoLogin: false,
    providers: [
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider(environment.googleClientId)
      },
      {
        id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider(environment.facebookClientId)
      }
    ]
  } as SocialAuthServiceConfig;
}

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['auth'], rehydrate: true})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    UserDetailComponent,
    DashboardComponent,
    MainComponent,
    LoginComponent,
    SignUpComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    EffectsModule.forRoot([LoginEffects, UserEffects]),
    AppRoutingModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppMaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ],
  providers: [
    httpInterceptorProviders,
    AuthGuardService,
    AuthService,
    UserService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: getAuthServiceConfigs()
    }
  ],
  bootstrap: [AppComponent],
  exports: [AppMaterialModule]
})
export class AppModule {
}
