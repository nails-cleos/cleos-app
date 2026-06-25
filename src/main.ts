import {
  importProvidersFrom,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateLoaderFactory } from './app/shared/translate-loader.factory';
import { provideStore } from '@ngrx/store';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { NgcCookieConsentConfig, NgcCookieConsentModule } from 'ngx-cookieconsent';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { PwaService } from './app/services/pwa.service';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { AuthUserService } from './app/services/auth-user.service';
import { CookieService } from 'ngx-cookie-service';
import { AsyncPipe, registerLocaleData } from '@angular/common';
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
import { reservationReducer } from './app/store/reducers/reservation.reducers';
import { paymentReducer } from './app/store/reducers/payment.reducers';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAppIcons } from './app/util/app-icons.provider';
import { provideAppCalendar, provideAppDateAdapter } from './app/util/adapter/app-date.provider';
import { AppRouterStateSerializer } from './app/util/router-state.serializer';
import { DEFAULT_LOCALE } from './app/util/dates';
import { AuthStore } from './app/store/auth.store';
import { AuthRedirectEffect } from './app/auth/auth-redirect.effect';
import { I18NStore } from './app/store/i18n.store';

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
    href: `${ environment.appServer }/privacy`,
  },
};

registerLocaleData(localeEnGB, DEFAULT_LOCALE);
registerLocaleData(localeNl, 'nl');
registerLocaleData(localeEs, 'es');

export function initializePwaService(pwaService: PwaService) {
  pwaService.initPwaPrompt();
}

const providers = [
  provideHttpClient(withInterceptors(httpInterceptorProviders), withJsonpSupport()),
  provideStore({
    reservation: reservationReducer,
    payment: paymentReducer,
  }),
  provideRouter(
    routes,
    withRouterConfig({ onSameUrlNavigation: 'reload' }),
    withComponentInputBinding(),
    withInMemoryScrolling({ anchorScrolling: 'enabled' }),
  ),
  provideRouterStore({ serializer: AppRouterStateSerializer }),
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
  AsyncPipe,
  CookieService,
  TranslateService,
  AuthUserService,
  {
    provide: LOCALE_ID,
    useValue: DEFAULT_LOCALE,
  },
  {
    provide: MAT_ICON_DEFAULT_OPTIONS,
    useValue: { fontSet: 'material-symbols-outlined' },
  },
  ...provideAppDateAdapter(),
  ...provideAppCalendar(),
  provideAppIcons(),
  provideAppInitializer(() => {
    inject(AuthRedirectEffect);
    const authStore = inject(AuthStore);
    authStore.hydrate();
    const i18nStore = inject(I18NStore);
    i18nStore.hydrate();
  }),
  provideAppInitializer(() => initializePwaService(inject(PwaService))),
  provideCharts(withDefaultRegisterables()),
];

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection(), ...providers],
}).catch(err => console.error(err));
