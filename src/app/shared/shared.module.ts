import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../util/app-material.module';
import { GeocodeService } from '../services/geocode.service';
import { CalendarDateFormatter, CalendarEventTitleFormatter, CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BaseChartDirective } from 'ng2-charts';
import { CustomDateFormatter } from './CustomDateFormatter';
import { CustomEventTitleFormatter } from './CustomEventTitleFormatter';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterLink } from '@angular/router';

const importExport = [
  CommonModule,
  AppMaterialModule,
  TranslateModule,
  ReactiveFormsModule,
  BaseChartDirective,
  FormsModule,
  RouterLink,
];

@NgModule({
  imports: [
    CalendarModule.forRoot({
      provide: DateAdapter, useFactory: adapterFactory,
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }, {
      dateFormatter: {
        provide: CalendarDateFormatter,
        useClass: CustomDateFormatter,
      }, eventTitleFormatter: {
        provide: CalendarEventTitleFormatter,
        useClass: CustomEventTitleFormatter,
      },
    }),
    GoogleMapsModule,
    ...importExport,
  ],
  exports: [
    ...importExport,
  ],
  providers: [
    GeocodeService,
  ],
})
export class SharedModule {
}
