import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectNotificationState } from '../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsNotification from '../store/notification.actions';
import { INotification } from '../interfaces/notification';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
import { zoneDateToDate } from '../util/dates';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [
    // nice stagger effect when showing existing elements
    trigger('list', [
      transition(':enter', [
        // child animation selector + stagger
        query('@items',
          stagger(300, animateChild())
        )
      ]),
    ]),
    trigger('items', [
      // cubic-bezier for a tiny bouncing feel
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1, height: '*' }),
        animate('1s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'scale(0.5)', opacity: 0, height: '0px', margin: '0px' }))
      ]),
    ])
  ]
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

  notification(notification: INotification): void {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      this.navigationService.reload(this.router.url.split('/'));
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

  remove(index: number): void {
    if (!this.notifications.length) {
      return;
    }
    const notification = this.notifications.splice(index, 1)[0];
    this.store.dispatch(
      new fromActionsNotification.NotificationDelete(Object.assign({}, notification, { deleted: true }))
    );
    if (!notification.read) {
      --this.badge;
    }
    if (this.notifications.length === 0 && this.showMore) {
      this.page = -1;
      this.getNotifications();
    }
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
  }
}
