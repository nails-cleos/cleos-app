import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { SharedModule } from '../shared/shared.module';
import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationsComponent } from './notifications.component';
import { MatRippleModule } from '@angular/material/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EffectsModule } from '@ngrx/effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { NotificationService } from '../services/notification.service';

export const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/notification/', '.json');

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    NotificationRoutingModule,
    SharedModule,
    MatCarouselModule.forRoot(),
    MatRippleModule,
    TranslateModule.forChild({
      loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient]},
      isolate: false,
      extend: true
    }),
    EffectsModule.forFeature([NotificationEffects])
  ],
  providers: [
    NotificationService
  ]
})
export class NotificationModule {
  constructor(protected translateService: TranslateService) {
    const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(currentLang);
  }
}
