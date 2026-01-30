import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { INotification } from '../interfaces/notification';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { zoneDateToDate } from '../util/dates';
import { addRemoveItemList, insertItemList } from '../util/animation';
import { SharedModule } from '../shared/shared.module';
import { MatRipple } from '@angular/material/core';
import { deleteNotification, getNotificationsPage, readNotification } from '../store/notification.actions';
import { PAGE_SIZE } from '../interfaces/pagination';
import { getNotificationsPipe } from '../store/selectors/notification.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationState } from '../store/reducers/notification.reducers';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [insertItemList, addRemoveItemList],
  imports: [SharedModule, MatRipple],
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

    this.notifications.update(currents => {
      const updated = [...currents];
      const notification = updated[index];

      if (notification) {
        updated[index] = { ...notification, deleted: true };
        this.store.dispatch(deleteNotification({ notification: updated[index] }));

        if (!notification.read) {
          --this.badge;
        }

        const visibleNotifications = updated.filter(n => !n.deleted);
        if (visibleNotifications.length === 0 && this.showMore) {
          this.page.set(0);
          this.getMoreNotifications();
        }
      }

      return updated;
    });
  };

}
