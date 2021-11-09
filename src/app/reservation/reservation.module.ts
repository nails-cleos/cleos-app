import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { AgmCoreModule } from '@agm/core';
import { CalendarModule } from 'angular-calendar';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { ReservationRoutingModule } from './reservation-routing.module';
import { environment } from '../../environments/environment';

import { SearchComponent } from './search/search.component';
import { ReservationComponent } from './reservation.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { CalendarComponent, CalendarDialogComponent } from './calendar/calendar.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';

@NgModule({
  declarations: [
    SearchComponent,
    ReservationComponent,
    ReservationDetailComponent,
    MoreInfoComponent,
    CalendarComponent,
    CalendarDialogComponent,
    ReservationCompleteComponent
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
    MatRadioModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ['places', 'geometry']
    }),
    MatStepperModule,
    MatChipsModule,
    MatExpansionModule
  ]
})
export class ReservationModule {
}
