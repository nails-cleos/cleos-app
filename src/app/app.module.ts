// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from './util/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SocialLoginModule } from 'angularx-social-login';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChartsModule } from 'ng2-charts';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { registerLocaleData } from '@angular/common';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { ServiceWorkerModule } from '@angular/service-worker';

// Providers
import { httpInterceptorProviders } from './http-interceptors';
import { GoogleLoginProvider, FacebookLoginProvider, SocialAuthServiceConfig } from 'angularx-social-login';
import { environment } from '../environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorI18n } from './util/paginator';
import { TranslationLoaderResolver } from './util/translation.resolver';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';

// Services
import { AuthGuardService } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { ProductService } from './services/product.service';
import { RoomService } from './services/room.service';
import { ReservationService } from './services/reservation.service';
import { WebsocketService } from './services/websocket.service';

// Reducers
import { reducers } from './store/app.states';

// Effects
import { LoginEffects } from './store/effects/auth.effects';
import { UserEffects } from './store/effects/user.effects';
import { ProductEffects } from './store/effects/product.effects';
import { RoomEffects } from './store/effects/room.effects';
import { ReservationEffects } from './store/effects/reservation.effects';
import { NotificationEffects } from './store/effects/notification.effects';

// Components
import { AppComponent } from './app.component';
import { UsersComponent } from './user/list/users.component';
import { UserDetailComponent } from './user/detail/user-detail.component';
import { MainComponent } from './main/main.component';
import { AuthComponent } from './auth/auth.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DialogComponent } from './dialog/dialog.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { UserComponent } from './user/user.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ProfileComponent } from './profile/profile.component';
import { NavComponent } from './nav/nav.component';
import { DashComponent } from './dash/dash.component';
import { CardChartComponent, CardComponent } from './card/card.component';
import { ProductsComponent } from './product/list/products.component';
import { ProductComponent } from './product/product.component';
import { ProductDetailComponent } from './product/detail/product-detail.component';
import { RoomComponent } from './room/room.component';
import { RoomsComponent } from './room/list/rooms.component';
import { RoomDetailComponent } from './room/detail/room-detail.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationsComponent } from './reservation/list/reservations.component';
import { ReservationDetailComponent } from './reservation/detail/reservation-detail.component';
import { AvailabilityComponent } from './availability/availability.component';
import { ProductReservationsChartComponent } from './charts/product-reservation-chart/product-reservations-chart.component';
import { MonthlyReservationsChartComponent } from './charts/monthly-reservations-chart/monthly-reservations-chart.component';
import { AnnualReservationsChartComponent } from './charts/annual-reservations-chart/annual-reservations-chart.component';
import { MiniCardComponent } from './mini-card/mini-card.component';
import { CustomerReservationsChartComponent } from './charts/customer-reservations-chart/customer-reservations-chart.component';
import { ReservationTableComponent } from './reservation/table/reservation-table.component';
import { QuantityProductReservationsChartComponent } from './charts/quantity-product-reservations-chart/quantity-product-reservations-chart.component';
import { LastMonthReservationsChartComponent } from './charts/last-month-reservations-chart/last-month-reservations-chart.component';
import { NotificationsComponent } from './notification/list/notifications.component';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

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

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    UserDetailComponent,
    MainComponent,
    AuthComponent,
    SignUpComponent,
    DialogComponent,
    ActivateAccountComponent,
    UserComponent,
    SignInComponent,
    ForgotPasswordComponent,
    RecoveryPasswordComponent,
    ChangePasswordComponent,
    ProfileComponent,
    NavComponent,
    DashComponent,
    CardComponent,
    ProductsComponent,
    ProductComponent,
    ProductDetailComponent,
    RoomComponent,
    RoomsComponent,
    RoomDetailComponent,
    ReservationComponent,
    ReservationsComponent,
    ReservationDetailComponent,
    AvailabilityComponent,
    ProductReservationsChartComponent,
    MonthlyReservationsChartComponent,
    AnnualReservationsChartComponent,
    MiniCardComponent,
    CustomerReservationsChartComponent,
    ReservationTableComponent,
    QuantityProductReservationsChartComponent,
    LastMonthReservationsChartComponent,
    CardChartComponent,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    EffectsModule.forRoot([LoginEffects, UserEffects, ProductEffects, RoomEffects, ReservationEffects, NotificationEffects]),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CalendarModule.forRoot({
      provide: DateAdapter, useFactory: adapterFactory
    }),
    ChartsModule,
    AppRoutingModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FormsModule,
    AppMaterialModule,
    MatPasswordStrengthModule.forRoot(),
    FlexLayoutModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately',
    })
  ],
  providers: [
    {
      provide: MatPaginatorIntl, deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService).getPaginatorIntl()
    },
    httpInterceptorProviders,
    AuthGuardService,
    AuthService,
    UserService,
    ProductService,
    RoomService,
    ReservationService,
    WebsocketService,
    TranslationLoaderResolver,
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
