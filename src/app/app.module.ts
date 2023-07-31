// Modules
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AsyncPipe, registerLocaleData } from '@angular/common';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker';
import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/compat/auth';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { AppCheckModule } from '@angular/fire/app-check';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';

// Providers
import { environment } from '../environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorI18n } from './util/paginator';
import { TranslationLoaderResolver } from './util/translation.resolver';
import localeEn from '@angular/common/locales/en';
import localeEnGB from '@angular/common/locales/en-GB';
import localeEnNL from '@angular/common/locales/en-NL';
import localeEs from '@angular/common/locales/es';
import localeAr from '@angular/common/locales/es-AR';
import { CookieService } from 'ngx-cookie-service';
import { TranslateLoaderFactory } from './shared/translate-loader.factory';
import { MAT_COLOR_FORMATS, NGX_MAT_COLOR_FORMATS, NgxMatColorPickerModule } from '@angular-material-components/color-picker';

// Services
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionsService } from './services/auth-guard.service';
import { TokenService } from './services/token.service';
import { NavigationService } from './services/navigation.service';
import { MessagingService } from './services/messaging.service';
import { PwaService } from './services/pwa.service';

// Reducers
import { reducers } from './store/app.states';

// Components
import { AppComponent } from './app.component';
import { AuthUserService } from './services/auth-user.service';

export const getAuthServiceConfigs = (): SocialAuthServiceConfig => ({
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
  ],
  onError: (err) => {
    console.error(err);
  }
});

export const localStorageSyncReducer =
  (reducer: ActionReducer<any>): ActionReducer<any> => localStorageSync({ keys: ['auth'], rehydrate: true })(reducer);

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEnGB, 'en-GB');
registerLocaleData(localeEnNL, 'en-NL');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeAr, 'es-AR');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('common')
      },
      isolate: false,
      extend: true
    }),
    AppRoutingModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    NgxMatColorPickerModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireAnalyticsModule,
    AngularFireDatabaseModule,
    AppCheckModule,
    RecaptchaV3Module
  ],
  providers: [
    {
      provide: MatPaginatorIntl, deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService).getPaginatorIntl()
    },
    PermissionsService,
    TokenService,
    NavigationService,
    TranslationLoaderResolver,
    MessagingService,
    AsyncPipe,
    CookieService,
    TranslateService,
    AuthUserService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: getAuthServiceConfigs()
    },
    {
      provide: MAT_COLOR_FORMATS,
      useValue: NGX_MAT_COLOR_FORMATS
    },
    {
      provide: LOCALE_ID,
      useValue: 'en-GB'
    },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptcha.siteKey,
    },
    {
      provide: FIREBASE_OPTIONS,
      useValue: environment.firebase
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (pwaService: PwaService) => () => pwaService.initPwaPrompt(),
      deps: [PwaService],
      multi: true
    },
    {
      provide: USE_AUTH_EMULATOR,
      useValue: !environment.production ? ['http://', 'localhost', 9099] : undefined
    }
  ],
  bootstrap: [AppComponent],
  exports: [TranslateModule]
})
export class AppModule {
  constructor(swPush: SwPush, private router: Router) {
    if (swPush.isEnabled) {
      swPush.notificationClicks.subscribe(({ action, notification }) =>
        router.navigate(notification.data.onActionClick[action].url));
    }
  }
}
