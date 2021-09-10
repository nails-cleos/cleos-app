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
import { ReservationTableComponent } from './reservation/table/reservation-table.component';
import { CalendarModule, CalendarMonthModule } from 'angular-calendar';

@NgModule({
  declarations: [
    DashComponent,
    MiniCardComponent,
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
