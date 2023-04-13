import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { CalendarModule, CalendarMonthModule } from 'angular-calendar';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { DashboardEffects } from '../store/effects/dashboard.effects';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { DashboardService } from '../services/dashboard.service';
import { ReservationService } from '../services/reservation.service';
import { PaymentService } from '../services/payment.service';
import { TreatmentService } from '../services/treatment.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { DayViewSchedulerComponent } from './day-view-scheduler.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DayViewSchedulerComponent
  ],
  imports: [
    DashboardRoutingModule,
    SharedModule,
    CalendarMonthModule,
    CalendarModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('dashboard')
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([DashboardEffects, ReservationEffects])
  ],
  providers: [
    DashboardService,
    ReservationService,
    PaymentService,
    TreatmentService,
    RoomService,
    UserService,
    AdditionalService,
    TrackingService
  ]
})
export class DashboardModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
