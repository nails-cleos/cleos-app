// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from './util/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule
} from 'angularx-social-login';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChartsModule } from 'ng2-charts';
import {
  CalendarDateFormatter,
  CalendarModule,
  CalendarNativeDateFormatter,
  DateAdapter,
  DateFormatterParams
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AsyncPipe, registerLocaleData } from '@angular/common';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker';
import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import firebase from 'firebase';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';

// Providers
import { httpInterceptorProviders } from './http-interceptors';
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
import { TokenService } from './services/token.service';
import { UserService } from './services/user.service';
import { ProductService } from './services/product.service';
import { RoomService } from './services/room.service';
import { ReservationService } from './services/reservation.service';
import { GeocodeService } from './services/geocode.service';
import { CatalogueService } from './services/catalogue.service';
import { UnavailableService } from './services/unavailable.service';
import { NavigationService } from './services/navigation.service';
import { MessagingService } from './services/messaging.service';
import { DiscountService } from './services/discount.service';
import { TrackingService } from './services/tracking.service';
import { MainService } from './services/main.service';
import { PaymentService } from './services/payment.service';

// Reducers
import { reducers } from './store/app.states';

// Effects
import { LoginEffects } from './store/effects/auth.effects';
import { UserEffects } from './store/effects/user.effects';
import { ProductEffects } from './store/effects/product.effects';
import { RoomEffects } from './store/effects/room.effects';
import { ReservationEffects } from './store/effects/reservation.effects';
import { NotificationEffects } from './store/effects/notification.effects';
import { CatalogueEffects } from './store/effects/catalogue.effects';
import { UnavailableEffects } from './store/effects/unavailable.effects';
import { DiscountEffects } from './store/effects/discount.effects';
import { MainEffects } from './store/effects/main.effects';
import { PaymentEffects } from './store/effects/payment.effects';

// Directives
import { DragDropDirective } from './directives/drag-drop.directive';
import { BackButtonDirective } from './directives/back-button.directive';

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
import { SearchComponent } from './reservation/search/search.component';
import { CompleteDialogComponent, ReservationDetailComponent } from './reservation/detail/reservation-detail.component';
import { AvailabilityComponent } from './availability/availability.component';
import { ProductReservationsChartComponent } from './charts/product-reservation-chart/product-reservations-chart.component';
import { MonthlyReservationsChartComponent } from './charts/monthly-reservations-chart/monthly-reservations-chart.component';
import { AnnualReservationsChartComponent } from './charts/annual-reservations-chart/annual-reservations-chart.component';
import { MiniCardComponent } from './mini-card/mini-card.component';
import { CustomerReservationsChartComponent } from './charts/customer-reservations-chart/customer-reservations-chart.component';
import { ReservationTableComponent } from './reservation/table/reservation-table.component';
import {
  QuantityProductReservationsChartComponent
} from './charts/quantity-product-reservations-chart/quantity-product-reservations-chart.component';
import { LastMonthReservationsChartComponent } from './charts/last-month-reservations-chart/last-month-reservations-chart.component';
import { TrackingAverageChartComponent } from './charts/tracking-average-chart/tracking-average-chart.component';
import { NotificationsComponent } from './notification/list/notifications.component';
import { RoomMeComponent } from './room/me/room-me.component';
import { CalendarComponent } from './reservation/calendar/calendar.component';
import { ErrorComponent } from './error/error.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { CataloguesComponent } from './catalogue/list/catalogues.component';
import { CatalogueDetailComponent } from './catalogue/detail/catalogue-detail.component';
import { CatalogComponent } from './catalog/catalog.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { UnavailableComponent } from './unavailable/unavailable.component';
import { UnavailableDetailComponent } from './unavailable/detail/unavailable-detail.component';
import { UnavailableListComponent } from './unavailable/list/unavailable-list.component';
import { ReservationsComponent } from './reservation/list/reservations.component';
import { MeReservationComponent } from './reservation/me/me-reservation.component';
import { RedirectComponent } from './redirect/redirect.component';
import {
  BottomSheetReferralComponent,
  BottomSheetShareComponent,
  ReferralsComponent
} from './referrals/referrals.component';
import { DiscountComponent } from './discount/discount.component';
import { DiscountDetailComponent } from './discount/detail/discount-detail.component';
import { DiscountDialogComponent, DiscountsComponent } from './discount/list/discounts.component';
import { MeDiscountComponent } from './discount/me/me-discount.component';
import { TrackingCompareChartComponent } from './charts/tracking-compare-chart/tracking-compare-chart.component';
import { MiniCardProductComponent } from './mini-card-product/mini-card-product.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { MainContentComponent } from './main/main-content/main-content.component';
import { PaymentCompleteComponent } from './reservation/payment/complete/payment-complete.component';
import { PaymentComponent } from './reservation/payment/payment.component';
import { MoreInfoComponent } from './reservation/detail/more-info/more-info.component';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, './assets/i18n/', '.json');

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

class CustomDateFormatter extends CalendarNativeDateFormatter {

  public dayViewHour({date, locale}: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }
}

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
    SearchComponent,
    ReservationDetailComponent,
    AvailabilityComponent,
    ProductReservationsChartComponent,
    MonthlyReservationsChartComponent,
    AnnualReservationsChartComponent,
    TrackingAverageChartComponent,
    MiniCardComponent,
    CustomerReservationsChartComponent,
    ReservationTableComponent,
    QuantityProductReservationsChartComponent,
    LastMonthReservationsChartComponent,
    CardChartComponent,
    NotificationsComponent,
    RoomMeComponent,
    ErrorComponent,
    CalendarComponent,
    GoogleMapComponent,
    CatalogueComponent,
    CataloguesComponent,
    CatalogueDetailComponent,
    CatalogComponent,
    ImageViewerComponent,
    UnavailableComponent,
    UnavailableDetailComponent,
    UnavailableListComponent,
    ReservationsComponent,
    DragDropDirective,
    BackButtonDirective,
    MeReservationComponent,
    RedirectComponent,
    ReferralsComponent,
    BottomSheetShareComponent,
    BottomSheetReferralComponent,
    DiscountComponent,
    DiscountDetailComponent,
    DiscountsComponent,
    DiscountDialogComponent,
    MeDiscountComponent,
    CompleteDialogComponent,
    TrackingCompareChartComponent,
    MiniCardProductComponent,
    PrivacyComponent,
    TermsAndConditionsComponent,
    MainContentComponent,
    PaymentCompleteComponent,
    PaymentComponent,
    MoreInfoComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    EffectsModule.forRoot([LoginEffects, UserEffects, ProductEffects, CatalogueEffects, RoomEffects, ReservationEffects,
      NotificationEffects, UnavailableEffects, DiscountEffects, MainEffects, PaymentEffects]),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CalendarModule.forRoot({
      provide: DateAdapter, useFactory: adapterFactory
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }, {
      dateFormatter: {
        provide: CalendarDateFormatter,
        useClass: CustomDateFormatter
      }
    }),
    ChartsModule,
    AppRoutingModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatFabMenuModule,
    AppMaterialModule,
    MatPasswordStrengthModule.forRoot(),
    FlexLayoutModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ['places', 'geometry']
    }),
    MatGoogleMapsAutocompleteModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireAnalyticsModule,
    MatCarouselModule.forRoot()
  ],
  providers: [
    {
      provide: MatPaginatorIntl, deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService).getPaginatorIntl()
    },
    httpInterceptorProviders,
    AuthGuardService,
    AuthService,
    TokenService,
    UserService,
    ProductService,
    RoomService,
    ReservationService,
    CatalogueService,
    UnavailableService,
    DiscountService,
    TrackingService,
    MainService,
    PaymentService,
    NavigationService,
    TranslationLoaderResolver,
    GeocodeService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: getAuthServiceConfigs()
    },
    MessagingService,
    AsyncPipe
  ],
  bootstrap: [AppComponent],
  exports: [AppMaterialModule]
})
export class AppModule {
  constructor(swPush: SwPush) {
    firebase.analytics();
    if (swPush.isEnabled) {
      navigator.serviceWorker
        .ready
        .then((registration) => firebase.messaging().useServiceWorker(registration));
    }
  }
}
