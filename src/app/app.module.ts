// Modules
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AsyncPipe, registerLocaleData } from '@angular/common';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker';
import { AppRoutingModule } from './app-routing.module';
import { Router } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { connectDatabaseEmulator, getDatabase, provideDatabase } from '@angular/fire/database';

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
import { TranslateLoaderFactory } from './shared/translate-loader.factory';
import { NgxColorsModule } from 'ngx-colors';
import { NgcCookieConsentConfig, NgcCookieConsentModule } from 'ngx-cookieconsent';

// Services
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { PermissionsService } from './services/auth-guard.service';
import { TokenService } from './services/token.service';
import { NavigationService } from './services/navigation.service';
import { MessagingService } from './services/messaging.service';
import { PwaService } from './services/pwa.service';
import { AuthUserService } from './services/auth-user.service';

// Reducers
import { reducers } from './store/app.states';

// Components
import { AppComponent } from './app.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const localStorageSyncReducer =
  (reducer: ActionReducer<any>): ActionReducer<any> => localStorageSync({ keys: ['auth'], rehydrate: true })(reducer);

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEnGB, 'en-GB');
registerLocaleData(localeEnNL, 'en-NL');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeAr, 'es-AR');

const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: environment.appDomain
  },
  position: 'top-right',
  theme: 'classic',
  palette: {
    popup: {
      background: '#a9a397',
      text: '#000',
      link: '#000'
    },
    button: {
      background: '#dcc8c2',
      text: '#000',
      border: 'transparent'
    }
  },
  type: 'info',
  content: {
    href: `${ environment.appServer }/privacy`,
  }
};

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
    NgcCookieConsentModule.forRoot(cookieConfig),
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    NgxColorsModule,
    AngularFireModule.initializeApp(environment.firebase)
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
      provide: LOCALE_ID,
      useValue: 'en-GB'
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (pwaService: PwaService) => () => pwaService.initPwaPrompt(),
      deps: [PwaService],
      multi: true
    },
    provideCharts(withDefaultRegisterables()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: false });
      }
      return auth;
    }),
    provideAppCheck(() => initializeAppCheck(getApp(), {
        provider: new ReCaptchaV3Provider(environment.recaptcha.siteKey),
        isTokenAutoRefreshEnabled: true
      })
    ),
    provideDatabase(() => {
      const database = getDatabase();
      if (environment.useEmulators) {
        connectDatabaseEmulator(database, 'localhost', 9000);
      }
      return database;
    }),
    provideMessaging(() => getMessaging()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService
  ],
  bootstrap: [AppComponent],
  exports: [TranslateModule]
})
export class AppModule {
  constructor(swPush: SwPush, router: Router) {
    if (swPush.isEnabled) {
      swPush.notificationClicks.subscribe(({ action, notification }) =>
        router.navigate(notification.data.onActionClick[action].url));
    }
  }
}
