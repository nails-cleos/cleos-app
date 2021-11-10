import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectNotificationState } from '../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsNotification from '../store/notification.actions';
import { INotification } from '../interfaces/notification';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  language: string;
  showMore = false;
  loadingNotifications: [] | undefined;

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private page: number;

  constructor(private router: Router, private store: Store<AppState>, private translate: TranslateService) {
    this.language = this.translate.currentLang;
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

  notification(notification: INotification): void {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      window.location.reload();
      this.store.dispatch(
        new fromActionsNotification.NotificationRead(notification)
      );
    }
  }

  getNotifications(): void {
    ++this.page;
    const payload = {
      active: 'date',
      direction: 'desc',
      page: this.page
    };
    this.store.dispatch(
      new fromActionsNotification.GetAllPaged(payload)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsNotification.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.data) {
        if (state.data.page?.content?.length) {
          if (state.data.page?.content[0]?.id) {
            this.loadingNotifications = undefined;
            this.notifications = this.notifications.concat(state.data.page.content);
            this.showMore = !state.data.page.last;
          } else {
            this.loadingNotifications = state.data.page.content;
          }
        } else {
          this.loadingNotifications = undefined;
        }
      }
    });
  }
}
