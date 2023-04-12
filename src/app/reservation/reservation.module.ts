import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { CalendarModule } from 'angular-calendar';
import { SharedModule } from '../shared/shared.module';
import { ReservationRoutingModule } from './reservation-routing.module';
import { environment } from '../../environments/environment';

import { SearchComponent } from './search/search.component';
import { ReservationComponent, SelectProfessionalDialogComponent } from './reservation.component';
import { ChangeCustomerDialogComponent, ReservationDetailComponent } from './detail/reservation-detail.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { EffectsModule } from '@ngrx/effects';
import { PaymentService } from '../services/payment.service';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { ReservationService } from '../services/reservation.service';
import { TreatmentService } from '../services/treatment.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { PaymentEffects } from '../store/effects/payment.effects';
import { TrackingService } from '../services/tracking.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

@NgModule({
  declarations: [
    SearchComponent,
    ReservationComponent,
    ReservationDetailComponent,
    MoreInfoComponent,
    CalendarComponent,
    ReservationCompleteComponent,
    ChangeCustomerDialogComponent,
    SelectProfessionalDialogComponent
  ],
  imports: [
    ReservationRoutingModule,
    SharedModule,
    MatFabMenuModule,
    CalendarModule,
    MatStepperModule,
    MatChipsModule,
    MatExpansionModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('reservation')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([ReservationEffects, PaymentEffects])
  ],
  providers: [
    ReservationService,
    PaymentService,
    TreatmentService,
    RoomService,
    UserService,
    AdditionalService,
    TrackingService
  ]
})
export class ReservationModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
