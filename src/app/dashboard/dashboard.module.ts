import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { DashboardComponent } from './dashboard.component';
import { MiniCardComponent } from './mini-card/mini-card.component';
import { ReservationTableComponent } from './reservation/table/reservation-table.component';
import { DashboardService } from '../services/dashboard.service';
import { provideEffects } from '@ngrx/effects';
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
import { provideState, Store } from '@ngrx/store';
import { ResultSummaryComponent } from './result-summary/result-summary.component';
import { TotalSummaryItemComponent } from './total-summary-item/total-summary-item.component';
import { DASHBOARD_FEATURE_KEY, dashboardReducer } from '../store/reducers/dashboard.reducers';
import { DashboardNavigationEffects } from './dashboard-navigation.effects';
import { DayViewSchedulerComponent } from './events/day-view-scheduler.component';
import { DashboardEventComponent } from './events/dashboard-event.component';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    DashboardComponent,
    DashboardEventComponent,
    MiniCardComponent,
    ReservationTableComponent,
    MonthSummaryComponent,
    YearSummaryComponent,
    YearComponent,
    QuarterSummaryComponent,
    MonthComponent,
    QuarterComponent,
    TotalSummaryComponent,
    ResultSummaryComponent,
    TotalSummaryItemComponent,
    DayViewSchedulerComponent,
    DashboardRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('dashboard'),
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true,
    }),
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
    ColorService,
    provideState(DASHBOARD_FEATURE_KEY, dashboardReducer),
    provideEffects(DashboardEffects, ReservationEffects, DashboardNavigationEffects),
  ],
})
export class DashboardModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      translateService.currentLang = '';
      this.translateService.use(language);
    });
  }
}
