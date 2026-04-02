import {
  enableProdMode,
  importProvidersFrom,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app/app-routing.module';
import { TranslateLoaderFactory } from './app/shared/translate-loader.factory';
import { ActionReducer, MetaReducer, provideStore } from '@ngrx/store';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { NgcCookieConsentConfig, NgcCookieConsentModule } from 'ngx-cookieconsent';
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
import localeEnGB from '@angular/common/locales/en-GB';
import localeNl from '@angular/common/locales/nl';
import localeEs from '@angular/common/locales/es';
import { provideHttpClient, withInterceptors, withJsonpSupport } from '@angular/common/http';
import { httpInterceptorProviders } from './app/http-interceptors';
import { provideRouterStore } from '@ngrx/router-store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { AUTH_FEATURE_KEY, authReducer } from './app/store/reducers/auth.reducers';
import { userReducer } from './app/store/reducers/user.reducers';
import { treatmentReducer } from './app/store/reducers/treatment.reducers';
import { catalogueReducer } from './app/store/reducers/catalogue.reducers';
import { roomReducer } from './app/store/reducers/room.reducers';
import { reservationReducer } from './app/store/reducers/reservation.reducers';
import { notificationReducer } from './app/store/reducers/notification.reducers';
import { unavailableReducer } from './app/store/reducers/unavailable.reducers';
import { discountReducer } from './app/store/reducers/discount.reducers';
import { mainReducer } from './app/store/reducers/main.reducers';
import { paymentReducer } from './app/store/reducers/payment.reducers';
import { dashboardReducer } from './app/store/reducers/dashboard.reducers';
import { additionalReducer } from './app/store/reducers/additional.reducers';
import { currencyReducer } from './app/store/reducers/currency.reducers';
import { officeReducer } from './app/store/reducers/office.reducers';
import { invoiceReducer } from './app/store/reducers/invoice.reducers';
import { colorReducer } from './app/store/reducers/color.reducers';
import { expenseReducer } from './app/store/reducers/expense.reducers';
import { noteReducer } from './app/store/reducers/note.reducers';
import { accountReducer } from './app/store/reducers/account.reducers';
import { i18nReducer } from './app/store/reducers/i18n.reducers';
import { I18NEffects } from './app/store/effects/i18n.effects';
import { provideEffects } from '@ngrx/effects';

export interface ISendMessage {
  name: string;
  email: string;
  subject: string;
  body: string;
}

const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: environment.appDomain,
  },
  position: 'top-right',
  theme: 'classic',
  palette: {
    popup: {
      background: '#b5ac9e',
      text: '#000',
      link: '#000',
    },
    button: {
      background: '#dcc8c2',
      text: '#000',
      border: 'transparent',
    },
  },
  type: 'info',
  content: {
    href: `${environment.appServer}/privacy`,
  },
};

const localStorageSyncReducer = (reducer: ActionReducer<any>): ActionReducer<any> => localStorageSync(
  { keys: [AUTH_FEATURE_KEY], rehydrate: true })(reducer);

registerLocaleData(localeEnGB, 'en-GB');
registerLocaleData(localeNl, 'nl');
registerLocaleData(localeEs, 'es');

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

export function initializePwaService(pwaService: PwaService) {
  pwaService.initPwaPrompt();
}

const providers = [
  provideHttpClient(withInterceptors(httpInterceptorProviders), withJsonpSupport()),
  provideStore({
    auth: authReducer,
    user: userReducer,
    treatment: treatmentReducer,
    catalogue: catalogueReducer,
    room: roomReducer,
    reservation: reservationReducer,
    notification: notificationReducer,
    unavailable: unavailableReducer,
    discount: discountReducer,
    main: mainReducer,
    payment: paymentReducer,
    dashboard: dashboardReducer,
    additional: additionalReducer,
    currency: currencyReducer,
    office: officeReducer,
    invoice: invoiceReducer,
    color: colorReducer,
    expense: expenseReducer,
    note: noteReducer,
    accounts: accountReducer,
    i18n: i18nReducer,
  }, { metaReducers }),
  provideRouterStore(),
  importProvidersFrom(
    BrowserModule,
    TranslateModule.forRoot({
      fallbackLang: 'en',
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('common'),
      },
      isolate: false,
      extend: true,
    }),
    NgcCookieConsentModule.forRoot(cookieConfig),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ),
  {
    provide: MatPaginatorIntl, deps: [TranslateService],
    useFactory: () => new PaginatorI18n().getPaginatorIntl(),
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
    useValue: 'en-GB',
  },
  {
    provide: MAT_ICON_DEFAULT_OPTIONS,
    useValue: { fontSet: 'material-symbols-outlined' },
  },
  provideAppInitializer(() => initializePwaService(inject(PwaService))),
  provideCharts(withDefaultRegisterables()),
  provideEffects(I18NEffects),
];

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection(), ...providers],
}).then(() => {
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.register('ngsw-worker.js');
  }
}).catch(err => console.error(err));
