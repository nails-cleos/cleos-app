// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from 'angularx-social-login';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AsyncPipe, registerLocaleData } from '@angular/common';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/messaging';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';

import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';

// Providers
import { httpInterceptorProviders } from './http-interceptors';
import { environment } from '../environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorI18n } from './util/paginator';
import { TranslationLoaderResolver } from './util/translation.resolver';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { CookieService } from 'ngx-cookie-service';
import { TranslateLoaderFactory } from './shared/translate-loader.factory';

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
  (reducer: ActionReducer<any>): ActionReducer<any> => localStorageSync({keys: ['auth'], rehydrate: true})(reducer);

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, {metaReducers}),
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
    AngularFireAnalyticsModule
  ],
  providers: [
    {
      provide: MatPaginatorIntl, deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService).getPaginatorIntl()
    },
    httpInterceptorProviders,
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
    CookieService
  ],
  bootstrap: [AppComponent],
  exports: [TranslateModule]
})
export class AppModule {
  constructor(swPush: SwPush, private router: Router) {
    firebase.analytics();
    if (swPush.isEnabled) {
      navigator.serviceWorker
        .ready.then((registration) => firebase.messaging().useServiceWorker(registration));
      swPush.notificationClicks.subscribe(({action, notification}) =>
        router.navigate(notification.data.onActionClick[action].url));
    }
  }
}
