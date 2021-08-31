import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { AgmCoreModule } from '@agm/core';
import {
  CalendarModule,
} from 'angular-calendar';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { ReservationRoutingModule } from './reservation-routing.module';
import { environment } from '../../environments/environment';

import { SearchComponent } from './search/search.component';
import { ReservationComponent } from './reservation.component';
import { CompleteDialogComponent, ReservationDetailComponent } from './detail/reservation-detail.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { CalendarComponent } from './calendar/calendar.component';

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
    CalendarModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ['places', 'geometry']
    })
  ]
})
export class ReservationModule {
}
