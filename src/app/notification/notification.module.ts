import { NgModule } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationsComponent } from './notifications.component';
import { provideEffects } from '@ngrx/effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { NotificationService } from '../services/notification.service';
import { provideState, Store } from '@ngrx/store';
import { NOTIFICATION_FEATURE_KEY, notificationReducer } from '../store/reducers/notification.reducers';
import { NotificationNavigationEffects } from './notification-navigation.effects';
import { I18NState } from '../store/reducers/i18n.reducers';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';

@NgModule({
  imports: [
    NotificationsComponent,
    NotificationRoutingModule,
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
      this.translateService.use(language);
    });
  }
}
