import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationsComponent } from './notifications.component';
import { MatRippleModule } from '@angular/material/core';
import { EffectsModule } from '@ngrx/effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { NotificationService } from '../services/notification.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    NotificationRoutingModule,
    SharedModule,
    MatRippleModule,
    MatBadgeModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('notification')
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
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
