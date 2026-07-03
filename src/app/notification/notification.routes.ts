import { Routes } from '@angular/router';
import { NotificationListComponent } from './list/notification-list.component';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { NotificationService } from '../services/notification.service';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [
  provideFeatureTranslations('notification'),
  NotificationService,
];

const children: Routes = [
  {
    path: '', component: NotificationListComponent, canActivate: [authGuard], data: {
      roles: [Role.admin, Role.professional, Role.customer],
    },
  },
];

export const NOTIFICATION_ROUTES: Routes = [{ path: '', providers, children }];
