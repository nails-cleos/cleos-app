import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { MatStepperModule } from '@angular/material/stepper';
import { EffectsModule } from '@ngrx/effects';
import { CalendarModule } from 'angular-calendar';

import { SharedModule } from '../shared/shared.module';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { ReservationRoutingModule } from './reservation-routing.module';

import { SearchComponent } from './search/search.component';
import { ReservationComponent } from './reservation.component';
import { SelectProfessionalDialogComponent } from './select-professional-dialog.component';
import { ReservationDetailComponent } from './detail/reservation-detail.component';
import { ChangeColorDialogComponent } from './detail/change-color-dialog.component';
import { ChangeCustomerDialogComponent } from './detail/change-customer-dialog.component';
import { AddNoteDialogComponent } from './detail/add-note-dialog.component';
import { AddDiscountDialogComponent } from './detail/add-discount-dialog.component';
import { MoreInfoComponent } from './detail/more-info/more-info.component';
import { ReservationCompleteComponent } from './detail/complete/reservation-complete.component';
import { CalendarComponent } from './calendar/calendar.component';

import { PaymentService } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';
import { TreatmentService } from '../services/treatment.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { TrackingService } from '../services/tracking.service';
import { ColorService } from '../services/color.service';
import { DiscountService } from '../services/discount.service';

import { ReservationEffects } from '../store/effects/reservation.effects';
import { PaymentEffects } from '../store/effects/payment.effects';
import { DiscountEffects } from '../store/effects/discount.effects';
import { CurrencyService } from '../services/currency.service';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';

@NgModule({
  declarations: [
    SearchComponent,
    ReservationComponent,
    ReservationDetailComponent,
    MoreInfoComponent,
    CalendarComponent,
    ReservationCompleteComponent,
    ChangeCustomerDialogComponent,
    ChangeColorDialogComponent,
    SelectProfessionalDialogComponent,
    AddNoteDialogComponent,
    AddDiscountDialogComponent
  ],
  imports: [
    ReservationRoutingModule,
    SharedModule,
    MatFabMenuModule,
    CalendarModule,
    MatStepperModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('reservation')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([ReservationEffects, PaymentEffects, DiscountEffects]),
  ],
  providers: [
    ReservationService,
    PaymentService,
    TreatmentService,
    RoomService,
    UserService,
    AdditionalService,
    TrackingService,
    ColorService,
    DiscountService,
    CurrencyService
  ]
})
export class ReservationModule {
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
