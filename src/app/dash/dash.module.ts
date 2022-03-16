import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { DashRoutingModule } from './dash-routing.module';

import { DashComponent } from './dash.component';
import { MiniCardComponent } from './mini-card/mini-card.component';
import { ReservationTableComponent } from './reservation/table/reservation-table.component';
import { CalendarModule, CalendarMonthModule } from 'angular-calendar';
import { DashboardService } from '../services/dashboard.service';
import { EffectsModule } from '@ngrx/effects';
import { DashboardEffects } from '../store/effects/dashboard.effects';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { ReservationService } from '../services/reservation.service';
import { PaymentService } from '../services/payment.service';
import { ProductService } from '../services/product.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

@NgModule({
  declarations: [
    DashComponent,
    MiniCardComponent,
    ReservationTableComponent
  ],
  imports: [
    DashRoutingModule,
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
    ProductService,
    RoomService,
    UserService,
    AdditionalService,
    TrackingService
  ]
})
export class DashModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
