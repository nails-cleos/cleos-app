import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationsComponent } from './notifications.component';
import { provideEffects } from '@ngrx/effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { NotificationService } from '../services/notification.service';
import { MissingTranslateHandler, TranslateLoaderFactory } from '../shared/translate-loader.factory';
import { provideState, Store } from '@ngrx/store';
import { NOTIFICATION_FEATURE_KEY, notificationReducer } from '../store/reducers/notification.reducers';
import { NotificationNavigationEffects } from './notification-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    NotificationsComponent,
    NotificationRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule('notification'),
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true,
    }),
  ],
  providers: [
    NotificationService,
    provideState(NOTIFICATION_FEATURE_KEY, notificationReducer),
    provideEffects(NotificationEffects, NotificationNavigationEffects),
  ],
})
export class NotificationModule {
  constructor(private readonly store: Store<I18NState>, protected translateService: TranslateService) {
    this.store.pipe(getI18NLanguagePipe).subscribe((language) => {
      translateService.currentLang = '';
      this.translateService.use(language);
    });
  }
}
