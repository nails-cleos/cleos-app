import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { INotification } from '../notification';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationService } from '../../services/navigation.service';
import { zoneDateToDate } from '../../util/dates';
import { PAGE_SIZE } from '../../interfaces/pagination';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { NotificationStore } from '../../store/notification.store';

const NOTIFICATION_LEAVE_ANIMATION_MS = 260;

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  imports: [MatIcon, MatIconButton, MatButton, TranslatePipe, DatePipe, MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationListComponent {
  readonly skeletonNotificationCards = Array.from({ length: 3 }, (_, index) => index);
  private readonly router: Router = inject(Router);
  private readonly notificationStore = inject(NotificationStore);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private notificationsSignal = computed(() => this.notificationStore.data());

  notifications = signal<INotification[]>([]);
  readonly language: string = this.navigationService.language;
  showMore = false;
  badge = 0;
  pageLoading = signal(false);

  private page = signal(0);

  constructor() {
    this.notificationStore.clean();
    effect(() => {
      const page = this.page();
      this.pageLoading.set(true);
      this.notificationStore.loadPage({ page: page, sort: 'date', direction: 'desc', size: PAGE_SIZE });
    });

    effect(() => {
      const notifications = this.notificationsSignal();
      if (notifications) {
        this.pageLoading.set(false);
        if (notifications.page?.content?.length) {
          const page = this.page();
          const pageNotifications = notifications.page.content
            .map((not: any) => Object.assign({}, not, { date: zoneDateToDate(not.date) }));
          this.notifications.update(currents => page === 0 ? pageNotifications : currents.concat(pageNotifications));
          this.showMore = !notifications.page.last;
          this.badge = notifications.unread;
        } else {
          if (this.page() === 0) {
            this.notifications.set([]);
          }
          this.showMore = false;
        }
      }
    });
  }

  notification = (notification: INotification): void => {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      this.navigationService.reload();
      this.notificationStore.read(notification.id);
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
    this.notificationStore.delete({ ...notification, deleted: true });

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
