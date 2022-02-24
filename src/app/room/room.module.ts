import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { RoomRoutingModule } from './room-routing.module';

import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { RoomMeComponent } from './me/room-me.component';
import { RoomDetailComponent } from './detail/room-detail.component';
import { AvailabilityComponent } from './availability/availability.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { RoomEffects } from '../store/effects/room.effects';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { AddServiceComponent, PriceDialogComponent } from './me/add-service/add-service.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/room/', '.json');

@NgModule({
  declarations: [
    RoomsComponent,
    RoomComponent,
    RoomMeComponent,
    RoomDetailComponent,
    AvailabilityComponent,
    AddServiceComponent,
    PriceDialogComponent
  ],
  imports: [
    RoomRoutingModule,
    SharedModule,
    MatExpansionModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([RoomEffects]),
    DragDropModule
  ],
  providers: [
    RoomService,
    UserService
  ]
})
export class RoomModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
