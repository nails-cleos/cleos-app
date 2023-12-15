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
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from '../store/app.states';
import { Observable } from 'rxjs';

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    NotificationRoutingModule,
    SharedModule,
    MatRippleModule,
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
  constructor(private readonly store: Store<AppState>, protected translateService: TranslateService) {
    const getI18nState: Observable<any> = this.store.select(selectI18nState);
    getI18nState.subscribe(state => {
      translateService.currentLang = '';
      this.translateService.use(state.data);
    });
  }
}
