import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { TreatmentService } from '../services/treatment.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { ColorService } from '../services/color.service';
import { MonthSummaryComponent } from './month-summary/month-summary.component';
import { YearSummaryComponent } from './year-summary/year-summary.component';
import { YearComponent } from './year-summary/year/year.component';
import { QuarterSummaryComponent } from './quarter-summary/quarter-summary.component';
import { MonthComponent } from './month-summary/month/month.component';
import { QuarterComponent } from './quarter-summary/quarter/quarter.component';
import { TotalSummaryComponent } from './total-summary/total-summary.component';
import { AppState, selectI18nState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@NgModule({
  declarations: [
    DashComponent,
    MiniCardComponent,
    ReservationTableComponent,
    MonthSummaryComponent,
    YearSummaryComponent,
    YearComponent,
    QuarterSummaryComponent,
    MonthComponent,
    QuarterComponent,
    TotalSummaryComponent
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
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
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
    TrackingService,
    ColorService
  ]
})
export class DashModule {

  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
