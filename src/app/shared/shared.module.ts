import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

import { AppMaterialModule } from '../util/app-material.module';
import { BackButtonDirective } from '../directives/back-button.directive';
import { AppState, selectAuthState } from '../store/app.states';
import { IUserAll } from '../interfaces/user';
import { environment } from '../../environments/environment';

import { ErrorComponent } from './error/error.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { DialogComponent } from './dialog/dialog.component';
import { GeocodeService } from '../services/geocode.service';
import { RatingComponent } from './rating/rating.component';
import { CalendarDateFormatter, CalendarEventTitleFormatter, CalendarModule, DateAdapter } from 'angular-calendar';
import { DateAdapter as Adapter } from '@angular/material/core';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { getLocale } from '../util/helper';

import { CardChartComponent, CardComponent } from './card/card.component';
import { ChartsModule } from 'ng2-charts';
import { CustomDateFormatter } from './CustomDateFormatter';
import { CustomEventTitleFormatter } from './CustomEventTitleFormatter';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartComponent } from './chart/chart.component';
import { httpInterceptorProviders } from '../http-interceptors';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    TranslateModule,
    CalendarModule.forRoot({
      provide: DateAdapter, useFactory: adapterFactory
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }, {
      dateFormatter: {
        provide: CalendarDateFormatter,
        useClass: CustomDateFormatter
      }, eventTitleFormatter: {
        provide: CalendarEventTitleFormatter,
        useClass: CustomEventTitleFormatter
      }
    }),
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ['places', 'geometry']
    }),
    MatGoogleMapsAutocompleteModule,
    ReactiveFormsModule,
    ChartsModule,
    FlexLayoutModule
  ],
  exports: [
    BackButtonDirective,
    ErrorComponent,
    GoogleMapComponent,
    DialogComponent,
    RatingComponent,
    CardChartComponent,
    CardComponent,
    FlexLayoutModule,
    ChartComponent
  ],
  declarations: [
    BackButtonDirective,
    ErrorComponent,
    GoogleMapComponent,
    DialogComponent,
    RatingComponent,
    CardChartComponent,
    CardComponent,
    ChartComponent
  ],
  providers: [
    httpInterceptorProviders,
    GeocodeService
  ]
})
export class SharedModule {
  constructor(private store: Store<AppState>, private translate: TranslateService, private dateAdapter: Adapter<any>) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.isAuthenticated) {
        const user: IUserAll = state.user;
        this.translate.use(getLocale(user.locale || navigator.language));
      } else {
        this.translate.use(getLocale(navigator.language));
      }
      this.dateAdapter.setLocale(this.translate.currentLang);
    });
  }
}
