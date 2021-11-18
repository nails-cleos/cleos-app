import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { MatFabMenuModule } from '@angular-material-extensions/fab-menu';
import { AgmCoreModule } from '@agm/core';
import { CalendarModule } from 'angular-calendar';
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
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { PaymentService } from '../services/payment.service';
import { ReservationEffects } from '../store/effects/reservation.effects';
import { ReservationService } from '../services/reservation.service';
import { ProductService } from '../services/product.service';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AdditionalService } from '../services/additional.service';
import { PaymentEffects } from '../store/effects/payment.effects';
import { TrackingService } from '../services/tracking.service';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/reservation/', '.json');

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
    MatFabMenuModule,
    CalendarModule,
    MatRadioModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ['places', 'geometry']
    }),
    MatStepperModule,
    MatChipsModule,
    MatExpansionModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([ReservationEffects, PaymentEffects])
  ],
  providers: [
    ReservationService,
    PaymentService,
    ProductService,
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
