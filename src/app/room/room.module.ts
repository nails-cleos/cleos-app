import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { RoomRoutingModule } from './room-routing.module';

import { RoomsComponent } from './list/rooms.component';
import { RoomComponent } from './room.component';
import { RoomMeComponent } from './me/room-me.component';
import { RoomDetailComponent } from './detail/room-detail.component';
import { AvailabilityComponent } from './availability/availability.component';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [
    RoomsComponent,
    RoomComponent,
    RoomMeComponent,
    RoomDetailComponent,
    AvailabilityComponent
  ],
  imports: [
    RoomRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    MatExpansionModule
  ]
})
export class RoomModule {
}
