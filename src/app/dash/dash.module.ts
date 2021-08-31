import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { DashRoutingModule } from './dash-routing.module';

import { DashComponent } from './dash.component';
import { MiniCardComponent } from './mini-card/mini-card.component';
import {
  QuantityProductReservationsChartComponent
} from './charts/quantity-product-reservations-chart/quantity-product-reservations-chart.component';
import { LastMonthReservationsChartComponent } from './charts/last-month-reservations-chart/last-month-reservations-chart.component';
import { ProductReservationsChartComponent } from './charts/product-reservation-chart/product-reservations-chart.component';
import { MonthlyReservationsChartComponent } from './charts/monthly-reservations-chart/monthly-reservations-chart.component';
import { AnnualReservationsChartComponent } from './charts/annual-reservations-chart/annual-reservations-chart.component';
import { TrackingAverageChartComponent } from './charts/tracking-average-chart/tracking-average-chart.component';
import { CustomerReservationsChartComponent } from './charts/customer-reservations-chart/customer-reservations-chart.component';
import { TrackingCompareChartComponent } from './charts/tracking-compare-chart/tracking-compare-chart.component';
import { ReservationTableComponent } from './reservation/table/reservation-table.component';
import { CalendarModule, CalendarMonthModule } from 'angular-calendar';

@NgModule({
  declarations: [
    DashComponent,
    MiniCardComponent,
    ProductReservationsChartComponent,
    MonthlyReservationsChartComponent,
    AnnualReservationsChartComponent,
    TrackingAverageChartComponent,
    TrackingCompareChartComponent,
    CustomerReservationsChartComponent,
    QuantityProductReservationsChartComponent,
    LastMonthReservationsChartComponent,
    ReservationTableComponent
  ],
  imports: [
    DashRoutingModule,
    SharedModule,
    CommonModule,
    ChartsModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    CalendarMonthModule,
    CalendarModule
  ]
})
export class DashModule {
}
