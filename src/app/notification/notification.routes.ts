import { Routes } from '@angular/router';
import { NotificationListComponent } from './list/notification-list.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { provideEffects } from '@ngrx/effects';
import { NotificationEffects } from '../store/effects/notification.effects';
import { NotificationService } from '../services/notification.service';
import { provideState } from '@ngrx/store';
import { NOTIFICATION_FEATURE_KEY, notificationReducer } from '../store/reducers/notification.reducers';
import { NotificationNavigationEffects } from './notification-navigation.effects';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('notification'),
  NotificationService,
  provideState(NOTIFICATION_FEATURE_KEY, notificationReducer),
  provideEffects(NotificationEffects, NotificationNavigationEffects),
];

const children: Routes = [
  {
    path: '', component: NotificationListComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.professional, Role.customer],
    },
  },
];

export const NOTIFICATION_ROUTES: Routes = [{ path: '', providers, children }];
