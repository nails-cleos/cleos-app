import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { INotification } from '../interfaces/notification';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { zoneDateToDate } from '../util/dates';
import { SharedModule } from '../shared/shared.module';
import { deleteNotification, getNotificationsPage, readNotification } from '../store/notification.actions';
import { PAGE_SIZE } from '../interfaces/pagination';
import { getNotificationsPipe } from '../store/selectors/notification.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationState } from '../store/reducers/notification.reducers';

const NOTIFICATION_LEAVE_ANIMATION_MS = 260;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly router: Router = inject(Router);
  private readonly store: Store<NotificationState> = inject(Store<NotificationState>);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private notifications$ = this.store.pipe(getNotificationsPipe);

  private notificationsSignal = toSignal(this.notifications$);

  notifications = signal<INotification[]>([]);
  dateFormat: string = this.translate.getCurrentLang();
  showMore = false;
  loadingNotifications?: Array<INotification>;
  badge = 0;

  private page = signal(0);

  constructor() {
    effect(() => {
      const page = this.page();
      this.store.dispatch(getNotificationsPage({ page: page, sort: 'date', direction: 'desc', size: PAGE_SIZE }));
    });

    effect(() => {
      const notifications = this.notificationsSignal();
      if (notifications) {
        if (notifications.page?.content?.length) {
          if (notifications.page?.content[0]?.id) {
            this.loadingNotifications = undefined;
            this.notifications.update(currents => currents.concat(notifications.page.content
              .map((not: any) => Object.assign({}, not, { date: zoneDateToDate(not.date) }))));
            this.showMore = !notifications.page.last;
            this.badge = notifications.unread;
          } else {
            this.loadingNotifications = notifications.page.content;
          }
        } else {
          this.loadingNotifications = undefined;
        }
      }
    });
  }

  notification = (notification: INotification): void => {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      this.navigationService.reload(this.router.url.split('/'));
      this.store.dispatch(readNotification({ id: notification.id }));
    }
  };

  getMoreNotifications = () => {
    this.page.update((n) => n + 1);
  };

  remove = (index: number): void => {
    if (!this.notifications().length) {
      return;
    }

    const notification = this.notifications()[index];
    if (!notification) {
      return;
    }

    this.notifications.update(currents => currents.map((current, currentIndex) => currentIndex === index
      ? { ...current, deleted: true }
      : current));

    this.store.dispatch(deleteNotification({ notification: { ...notification, deleted: true } }));

    if (!notification.read) {
      --this.badge;
    }

    const visibleNotifications = this.notifications().filter(n => !n.deleted);
    if (visibleNotifications.length === 0 && this.showMore) {
      this.page.set(0);
      this.getMoreNotifications();
    }

    setTimeout(() => {
      this.notifications.update(currents => currents.filter(current => current.id !== notification.id));
    }, NOTIFICATION_LEAVE_ANIMATION_MS);
  };

}
