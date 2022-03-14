import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { SharedModule } from '../shared/shared.module';
import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationsComponent } from './notifications.component';
import { MatRippleModule } from '@angular/material/core';
import { EffectsModule } from '@ngrx/effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { NotificationService } from '../services/notification.service';
import { TranslateLoaderFactory } from '../shared/translate-loader.factory';

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
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('notification')
      },
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
