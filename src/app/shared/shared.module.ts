import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppMaterialModule } from '../util/app-material.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { AppState, selectAuthState } from '../store/app.states';
import { IUserAll } from '../interfaces/user';

import { ErrorComponent } from './error/error.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { DialogComponent } from './dialog/dialog.component';
import { GeocodeService } from '../services/geocode.service';
import { RatingComponent } from './rating/rating.component';
import { CalendarDateFormatter, CalendarEventTitleFormatter, CalendarModule, DateAdapter } from 'angular-calendar';
import { DateAdapter as Adapter } from '@angular/material/core';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { getLocale } from '../util/helper';

import { CardChartComponent, CardComponent } from './card/card.component';
import { NgChartsModule } from 'ng2-charts';
import { CustomDateFormatter } from './CustomDateFormatter';
import { CustomEventTitleFormatter } from './CustomEventTitleFormatter';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartComponent } from './chart/chart.component';
import { httpInterceptorProviders } from '../http-interceptors';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { UserNamePipe } from '../pipes/user-name.pipe';
import { TimeDetailPipe } from '../pipes/time-detail.pipe';
import { TimeZoneSnackBarComponent } from './snak/time-zone/time-zone-snack-bar.component';
import { DurationTimePipe } from '../pipes/durationTime.pipe';
import { RoomNamePipe } from '../pipes/room-name.pipe';
import { CurrencySymbolPipe } from '../pipes/currency-symbol.pipe';
import { ReservationIconPipe } from '../pipes/reservation-icon.pipe';
import { ConvertHMPipe } from '../pipes/convert-hm.pipe';
import { CounterComponent } from '../util/counter/counter.component';
import { CalendarDialogComponent } from './calendar-dialog/calendar-dialog.component';
import { GoogleMapsModule } from "@angular/google-maps";

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
    AppMaterialModule,
    FlexLayoutModule,
    HttpClientModule,
    HttpClientJsonpModule,
    NgChartsModule,
    FormsModule,
    BackButtonDirective,
    SortByPipe,
    UserNamePipe,
    TimeDetailPipe,
    DurationTimePipe,
    RoomNamePipe,
    CurrencySymbolPipe,
    ReservationIconPipe,
    ConvertHMPipe,
    ErrorComponent,
    GoogleMapComponent,
    DialogComponent,
    RatingComponent,
    CardChartComponent,
    CardComponent,
    ChartComponent,
    TimeZoneSnackBarComponent,
    CounterComponent,
    CalendarDialogComponent
  ],
  declarations: [
    BackButtonDirective,
    SortByPipe,
    UserNamePipe,
    TimeDetailPipe,
    DurationTimePipe,
    RoomNamePipe,
    CurrencySymbolPipe,
    ReservationIconPipe,
    ConvertHMPipe,
    ErrorComponent,
    GoogleMapComponent,
    DialogComponent,
    RatingComponent,
    CardChartComponent,
    CardComponent,
    ChartComponent,
    TimeZoneSnackBarComponent,
    CounterComponent,
    CalendarDialogComponent
  ],
  providers: [
    httpInterceptorProviders,
    GeocodeService
  ]
})
export class SharedModule {
  constructor(private store: Store<AppState>, private translate: TranslateService, private dateAdapter: Adapter<any>) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.isAuthenticated) {
        const user: IUserAll = state.user;
        this.translate.use(getLocale(user.locale || navigator.language));
      } else {
        this.translate.use(getLocale(navigator.language));
      }
      this.dateAdapter.setLocale(this.translate.currentLang);
    });
  }
}
