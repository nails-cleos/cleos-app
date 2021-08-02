import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppMaterialModule } from '../util/app-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../util/SharedModule';
import { DashRoutingModule } from './dash-routing.module';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { DashComponent } from './dash.component';
import { MiniCardComponent } from '../mini-card/mini-card.component';
import { CardChartComponent, CardComponent } from '../card/card.component';
import {
  QuantityProductReservationsChartComponent
} from '../charts/quantity-product-reservations-chart/quantity-product-reservations-chart.component';
import { LastMonthReservationsChartComponent } from '../charts/last-month-reservations-chart/last-month-reservations-chart.component';
import { ProductReservationsChartComponent } from '../charts/product-reservation-chart/product-reservations-chart.component';
import { MonthlyReservationsChartComponent } from '../charts/monthly-reservations-chart/monthly-reservations-chart.component';
import { AnnualReservationsChartComponent } from '../charts/annual-reservations-chart/annual-reservations-chart.component';
import { TrackingAverageChartComponent } from '../charts/tracking-average-chart/tracking-average-chart.component';
import { CustomerReservationsChartComponent } from '../charts/customer-reservations-chart/customer-reservations-chart.component';
import { TrackingCompareChartComponent } from '../charts/tracking-compare-chart/tracking-compare-chart.component';
import { ReservationTableComponent } from '../reservation/table/reservation-table.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    DashComponent,
    CardComponent,
    MiniCardComponent,
    ProductReservationsChartComponent,
    MonthlyReservationsChartComponent,
    AnnualReservationsChartComponent,
    TrackingAverageChartComponent,
    TrackingCompareChartComponent,
    CustomerReservationsChartComponent,
    QuantityProductReservationsChartComponent,
    LastMonthReservationsChartComponent,
    ReservationTableComponent,
    CardChartComponent
  ],
  imports: [
    DashRoutingModule,
    SharedModule,
    CommonModule,
    ChartsModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatPasswordStrengthModule.forRoot(),
    AppMaterialModule,
    MatCarouselModule.forRoot()
  ]
})
export class DashModule {
}
