import { enableProdMode, importProvidersFrom, inject, LOCALE_ID, provideAppInitializer } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { TranslateLoaderFactory } from './app/shared/translate-loader.factory';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './app/store/app.states';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { connectDatabaseEmulator, getDatabase, provideDatabase } from '@angular/fire/database';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { NgcCookieConsentConfig, NgcCookieConsentModule } from 'ngx-cookieconsent';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PwaService } from './app/services/pwa.service';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { AuthUserService } from './app/services/auth-user.service';
import { CookieService } from 'ngx-cookie-service';
import { AsyncPipe, registerLocaleData } from '@angular/common';
import { MessagingService } from './app/services/messaging.service';
import { TranslationLoaderResolver } from './app/util/translation.resolver';
import { NavigationService } from './app/services/navigation.service';
import { TokenService } from './app/services/token.service';
import { PermissionsService } from './app/services/auth-guard.service';
import { PaginatorI18n } from './app/util/paginator';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { localStorageSync } from "ngrx-store-localstorage";
import localeEn from '@angular/common/locales/en';
import localeEnGB from '@angular/common/locales/en-GB';
import localeEnNL from '@angular/common/locales/en-NL';
import localeEs from '@angular/common/locales/es';
import localeAr from '@angular/common/locales/es-AR';
import { provideHttpClient, withInterceptors, withJsonpSupport } from "@angular/common/http";
import { httpInterceptorProviders } from "./app/http-interceptors";

const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: environment.appDomain
  },
  position: 'top-right',
  theme: 'classic',
  palette: {
    popup: {
      background: '#b5ac9e',
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

const localStorageSyncReducer =
  (reducer: ActionReducer<any>): ActionReducer<any> => localStorageSync({ keys: ['auth'], rehydrate: true })(reducer);

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEnGB, 'en-GB');
registerLocaleData(localeEnNL, 'en-NL');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeAr, 'es-AR');

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

const providersFrom = importProvidersFrom(BrowserModule, StoreModule.forRoot(reducers, { metaReducers }),
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
  ServiceWorkerModule.register('ngsw-worker.js', {
    enabled: environment.production,
    registrationStrategy: 'registerWhenStable:30000'
  }),
  AngularFireModule.initializeApp(environment.firebase)
);

const authProvider = provideAuth(() => {
  const auth = getAuth();
  if (environment.useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: false });
  }
  return auth;
});

const appCheckProvider = provideAppCheck(() => initializeAppCheck(getApp(), {
  provider: new ReCaptchaV3Provider(environment.recaptcha.siteKey),
  isTokenAutoRefreshEnabled: true
}));

const databaseProvider = provideDatabase(() => {
  const database = getDatabase();
  if (environment.useEmulators) {
    connectDatabaseEmulator(database, 'localhost', 9000);
  }
  return database;
});

export function initializePwaService(pwaService: PwaService) {
  pwaService.initPwaPrompt()
}

const providers = [
  provideHttpClient(withInterceptors(httpInterceptorProviders), withJsonpSupport()),
  providersFrom,
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
    provide: MAT_ICON_DEFAULT_OPTIONS,
    useValue: { fontSet: 'material-symbols-outlined' }
  },
  provideAppInitializer(() => initializePwaService(inject(PwaService))),
  provideCharts(withDefaultRegisterables()),
  provideFirebaseApp(() => initializeApp(environment.firebase)),
  authProvider,
  appCheckProvider,
  databaseProvider,
  provideMessaging(() => getMessaging()),
  provideAnalytics(() => getAnalytics()),
  ScreenTrackingService,
  UserTrackingService,
  provideAnimations()
]

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [...providers]
}).then(() => {
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.register('ngsw-worker.js');
  }
}).catch(err => console.error(err));
