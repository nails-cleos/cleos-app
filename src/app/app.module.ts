// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule
} from '@abacritt/angularx-social-login';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AsyncPipe, registerLocaleData } from '@angular/common';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker';
import { AngularFireModule, FirebaseApp } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';
import { getMessaging } from "firebase/messaging";

import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';

import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';

// Providers
import { environment } from '../environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorI18n } from './util/paginator';
import { TranslationLoaderResolver } from './util/translation.resolver';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { CookieService } from 'ngx-cookie-service';
import { TranslateLoaderFactory } from './shared/translate-loader.factory';
import {
  MAT_COLOR_FORMATS,
  NGX_MAT_COLOR_FORMATS,
  NgxMatColorPickerModule
} from '@angular-material-components/color-picker';

// Services
import { AuthGuardService } from './services/auth-guard.service';
import { TokenService } from './services/token.service';
import { NavigationService } from './services/navigation.service';
import { MessagingService } from './services/messaging.service';
import { PromptUpdateService } from './services/prompt-update.service';

// Reducers
import { reducers } from './store/app.states';

// Components
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';

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
  ]
} as SocialAuthServiceConfig);

export const localStorageSyncReducer =
  (reducer: ActionReducer<any>): ActionReducer<any> => localStorageSync({ keys: ['auth'], rehydrate: true })(reducer);

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    TranslateModule.forRoot({
      defaultLanguage: 'es',
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
    MatFabMenuModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireMessagingModule,
    AngularFireAnalyticsModule,
    NgxMatColorPickerModule
  ],
  providers: [
    {
      provide: MatPaginatorIntl, deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService).getPaginatorIntl()
    },
    AuthGuardService,
    TokenService,
    NavigationService,
    TranslationLoaderResolver,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: getAuthServiceConfigs()
    },
    MessagingService,
    AsyncPipe,
    PromptUpdateService,
    CookieService,
    {
      provide: MAT_COLOR_FORMATS,
      useValue: NGX_MAT_COLOR_FORMATS
    }
  ],
  bootstrap: [AppComponent],
  exports: [TranslateModule]
})
export class AppModule {
  constructor(swPush: SwPush, private router: Router, firebaseApp: FirebaseApp) {
    firebase.analytics();
    if (swPush.isEnabled) {
      const messaging = getMessaging(firebaseApp)
      // navigator.serviceWorker
      //   .ready.then((registration) => messaging.useServiceWorker(registration));
      swPush.notificationClicks.subscribe(({ action, notification }) =>
        router.navigate(notification.data.onActionClick[action].url));
    }
  }
}
