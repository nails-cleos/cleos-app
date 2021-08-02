import { NgModule } from '@angular/core';
import { BackButtonDirective } from '../directives/back-button.directive';
import { MiniCardProductComponent } from '../mini-card-product/mini-card-product.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppMaterialModule } from './app-material.module';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../error/error.component';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../store/app.states';
import { IUserAll } from '../interfaces/user';
import { GoogleMapComponent } from '../google-map/google-map.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../environments/environment';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { CompleteDialogComponent } from '../reservation/detail/reservation-detail.component';
import { DialogComponent } from '../dialog/dialog.component';
import { GeocodeService } from '../services/geocode.service';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    TranslateModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ['places', 'geometry']
    }),
    MatGoogleMapsAutocompleteModule,
    ReactiveFormsModule
  ],
  exports: [
    BackButtonDirective,
    MiniCardProductComponent,
    ErrorComponent,
    GoogleMapComponent,
    CompleteDialogComponent,
    DialogComponent
  ],
  declarations: [
    BackButtonDirective,
    MiniCardProductComponent,
    ErrorComponent,
    GoogleMapComponent,
    CompleteDialogComponent,
    DialogComponent
  ],
  providers: [
    GeocodeService
  ]
})
export class SharedModule {
  constructor(private store: Store<AppState>, private translate: TranslateService) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.isAuthenticated) {
        const user: IUserAll = state.user;
        this.translate.use(user.lang || navigator.language);
      } else {
        this.translate.use(navigator.language);
      }
    });
  }
}
