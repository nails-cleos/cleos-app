import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectNotificationState } from '../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsNotification from '../store/notification.actions';
import { INotification } from '../interfaces/notification';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { zoneDateToDate } from '../util/dates';
import { addRemoveItemList, insertItemList } from '../util/animation';
import { SharedModule } from '../shared/shared.module';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [insertItemList, addRemoveItemList],
  imports: [SharedModule, MatRipple],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  dateFormat: string;
  showMore = false;
  loadingNotifications?: [];
  badge = 0;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private page: number;

  constructor(private router: Router, private store: Store<AppState>, private translate: TranslateService,
              private navigationService: NavigationService) {
    this.dateFormat = this.translate.currentLang;
    this.getState = this.store.select(selectNotificationState);
    this.page = -1;
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getNotifications();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  notification = (notification: INotification): void => {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      this.navigationService.reload(this.router.url.split('/'));
      this.store.dispatch(
        new fromActionsNotification.ReadNotification(notification.id),
      );
    }
  };

  getNotifications = (): void => this.store.dispatch(
    new fromActionsNotification.GetNotificationsPage(++this.page, 'date', 'desc'),
  );

  remove = (index: number): void => {
    if (!this.notifications.length) {
      return;
    }
    const notification = this.notifications.splice(index, 1)[0];
    this.store.dispatch(
      new fromActionsNotification.DeleteNotification(Object.assign({}, notification, { deleted: true })),
    );
    if (!notification.read) {
      --this.badge;
    }
    if (this.notifications.length === 0 && this.showMore) {
      this.page = -1;
      this.getNotifications();
    }
  };

  private clean = (): void => this.store.dispatch(new fromActionsNotification.Clean());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.data) {
        if (state.data.page?.content?.length) {
          if (state.data.page?.content[0]?.id) {
            this.loadingNotifications = undefined;
            if (!state.dataDeleted) {
              this.notifications = this.notifications.concat(state.data.page.content
                .map((not: any) => Object.assign({}, not, { date: zoneDateToDate(not.date) })));
              this.showMore = !state.data.page.last;
              this.badge = state.data.unread;
            }
          } else {
            this.loadingNotifications = state.data.page.content;
          }
        } else {
          this.loadingNotifications = undefined;
        }
      }
    });
  };
}
