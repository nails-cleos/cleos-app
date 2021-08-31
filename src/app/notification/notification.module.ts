import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCarouselModule } from '@ngbmodule/material-carousel';

import { AppMaterialModule } from '../util/app-material.module';
import { SharedModule } from '../shared/shared.module';
import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationsComponent } from './list/notifications.component';

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    NotificationRoutingModule,
    SharedModule,
    CommonModule,
    TranslateModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    MatCarouselModule.forRoot()
  ]
})
export class NotificationModule {
}
