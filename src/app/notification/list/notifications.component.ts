import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectNotificationState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsNotification from '../../store/notification.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { INotification } from '../../interfaces/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  getState: Observable<any>;
  subscription: Subscription | undefined;
  error: string | undefined;
  page: number;
  language: string;
  showMore = false;
  isLoading = false;
  loadingNotifications: [] | undefined;

  constructor(private router: Router, private store: Store<AppState>, private snackBar: MatSnackBar, private translate: TranslateService) {
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
        if (state.data.page.content[0].id) {
          this.loadingNotifications = undefined;
          this.notifications = this.notifications.concat(state.data.page.content);
          this.showMore = !state.data.page.last;
        } else {
          this.loadingNotifications = state.data.page.content;
        }
      }
      if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
        this.error = state.error;
      }
      this.isLoading = state.isLoading;
    });
  }
}
