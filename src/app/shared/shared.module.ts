import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../util/app-material.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import { SortByPipe } from '../pipes/sort-by.pipe';

import { ErrorComponent } from './error/error.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { DialogComponent } from './dialog/generic/dialog.component';
import { GeocodeService } from '../services/geocode.service';
import { RatingComponent } from './rating/rating.component';
import { CalendarDateFormatter, CalendarEventTitleFormatter, CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { CardChartComponent, CardComponent } from './card/card.component';
import { NgChartsModule } from 'ng2-charts';
import { CustomDateFormatter } from './CustomDateFormatter';
import { CustomEventTitleFormatter } from './CustomEventTitleFormatter';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartComponent } from './chart/chart.component';
import { httpInterceptorProviders } from '../http-interceptors';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { TimeDetailPipe } from '../pipes/time-detail.pipe';
import { TimeZoneSnackBarComponent } from './snak/time-zone/time-zone-snack-bar.component';
import { DurationTimePipe } from '../pipes/durationTime.pipe';
import { RoomNamePipe } from '../pipes/room-name.pipe';
import { CurrencySymbolPipe } from '../pipes/currency-symbol.pipe';
import { ReservationIconPipe } from '../pipes/reservation-icon.pipe';
import { ConvertHMPipe } from '../pipes/convert-hm.pipe';
import { CounterComponent } from '../util/counter/counter.component';
import { CalendarDialogComponent } from './dialog/calendar/calendar-dialog.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { BankComponent } from './bank/bank.component';
import { PriceComponent } from './price/price.component';
import { CustomerEditDialogComponent } from './dialog/customer-edit/customer-edit-dialog.component';
import { CancelDialogComponent } from './dialog/cancel/cancel-dialog.component';
import { FilterByPipe } from '../pipes/filterBy.pipe';
import { DiscountPipe } from '../pipes/discount.pipe';
import { TwoDigitsDirective } from '../directives/two-digits.directive';
import { PromptComponent } from './prompt/prompt.component';
import { HideMissingDirective } from '../directives/hide-missing.directive';
import { PaymentPreviewComponent } from './payment-preview/payment-preview.component';
import { PricePreviewComponent } from './price-preview/price-preview.component';
import { AnimateDirective } from '../directives/animate.directive';

const importExport = [
  // Directives
  BackButtonDirective,
  HideMissingDirective,
  TwoDigitsDirective,
  AnimateDirective,

  // Pipes
  SortByPipe,
  TimeDetailPipe,
  DurationTimePipe,
  RoomNamePipe,
  CurrencySymbolPipe,
  ReservationIconPipe,
  ConvertHMPipe,
  FilterByPipe,
  DiscountPipe,

  // Components
  ErrorComponent,
  GoogleMapComponent,
  RatingComponent,
  CardChartComponent,
  CardComponent,
  ChartComponent,
  TimeZoneSnackBarComponent,
  CounterComponent,
  BankComponent,
  PriceComponent,
  DialogComponent,
  CalendarDialogComponent,
  CustomerEditDialogComponent,
  CancelDialogComponent,
  PromptComponent,
  PaymentPreviewComponent,
  PricePreviewComponent
];

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    TranslateModule,
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
      }, eventTitleFormatter: {
        provide: CalendarEventTitleFormatter,
        useClass: CustomEventTitleFormatter
      }
    }),
    GoogleMapsModule,
    ReactiveFormsModule,
    NgChartsModule,
    FlexLayoutModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FormsModule
  ],
  exports: [
    AppMaterialModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpClientModule,
    HttpClientJsonpModule,
    NgChartsModule,
    FormsModule,
    ...importExport
  ],
  declarations: [
    ...importExport
  ],
  providers: [
    httpInterceptorProviders,
    GeocodeService
  ]
})
export class SharedModule {
}
