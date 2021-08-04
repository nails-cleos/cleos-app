import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { AgmCoreModule } from '@agm/core';
import {
  CalendarDateFormatter,
  CalendarModule,
  CalendarNativeDateFormatter,
  DateAdapter,
  DateFormatterParams
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { ReservationRoutingModule } from './reservation-routing.module';
import { environment } from '../../environments/environment';

import { SearchComponent } from './search/search.component';
import { ReservationComponent } from './reservation.component';
import { CompleteDialogComponent, ReservationDetailComponent } from './detail/reservation-detail.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { CalendarComponent } from './calendar/calendar.component';

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
    SearchComponent,
    ReservationComponent,
    ReservationDetailComponent,
    MoreInfoComponent,
    CalendarComponent,
    CompleteDialogComponent
  ],
  imports: [
    ReservationRoutingModule,
    SharedModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    TranslateModule,
    MatFabMenuModule,
    FlexLayoutModule,
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
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ['places', 'geometry']
    })
  ]
})
export class ReservationModule {
}
