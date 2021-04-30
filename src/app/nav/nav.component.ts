import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectNotificationState } from '../store/app.states';
import { IMenu, IUser } from '../interfaces/user';
import * as fromActionsLogin from '../store/auth.actions';
import * as fromActionsNotification from '../store/notification.actions';
import { WebsocketService } from '../services/websocket.service';
import { INotification } from '../interfaces/notification';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  menuItems: IMenu[] = [];
  notifications: INotification[] = [];
  workDay: INotification[] = [];
  currentUser!: IUser | null;
  username: string | undefined;
  getState: Observable<any>;
  getNotificationState: Observable<any>;
  canChangePassword = false;
  authSubscription: Subscription | undefined;
  notificationSubscription: Subscription | undefined;
  language: string;
  isAuthorized = false;

  showInitials = false;
  initials: string | undefined;
  countNotifications = 0;
  plusNotification: string | undefined;

  constructor(public translate: TranslateService, private breakpointObserver: BreakpointObserver, private router: Router,
              private store: Store<AppState>, private webSocketService: WebsocketService) {
    this.language = this.translate.currentLang;
    this.getState = this.store.select(selectAuthState);
    this.getNotificationState = this.store.select(selectNotificationState);
  }

  ngOnInit(): void {
    this.subscribe();
  }

  logout(): void {
    this.store.dispatch(
      new fromActionsLogin.LogOut()
    );
    this.router.navigate(['main']);
  }

  notification(notification: INotification): void {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      this.countNotifications--;
      if (this.countNotifications < 10) {
        this.plusNotification = undefined;
      }
      notification.read = true;
      this.store.dispatch(
        new fromActionsNotification.NotificationRead(notification)
      );
    }
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
  }

  private subscribe(): void {
    this.authSubscription = this.getState.subscribe((state) => {
      this.isAuthorized = state.isAuthenticated;
      if (state.isAuthenticated) {
        this.getNotifications();
        const user = state.user;
        this.translate.use(user.lang || navigator.language);
        this.language = user.lang || navigator.language;
        this.currentUser = user;
        this.menuItems = state.menus;
        this.canChangePassword = user?.provider === 'LOCAL';
        if (user.firstName) {
          this.username = `${user.firstName} ${user?.lastName}`;
          this.initials = `${user.firstName.charAt(0)} ${user?.lastName?.charAt(0)}`;
        } else {
          this.username = user?.username;
          this.initials = user?.username?.charAt(0);
        }

        if (!this.currentUser?.imageUrl) {
          this.showInitials = true;
        }
        const stompClient = this.webSocketService.connect();
        stompClient.connect({}, () => {
          stompClient.subscribe(`/user/${user.username}/reply`, (data: any) => {
            this.notifications = [JSON.parse(data.body) as INotification].concat(this.notifications);
            if (this.notifications.length > 9) {
              this.notifications.splice(-1, 1);
            }
            this.countNotifications++;
            if (this.countNotifications > 9) {
              this.plusNotification = '+9';
            }
          });
        });
      } else {
        this.translate.use(navigator.language);
        this.language = navigator.language;
      }
    });

    this.notificationSubscription = this.getNotificationState.subscribe((state) => {
      if (state.data && state.data.page.content[0].id) {
        this.workDay = state.data.workDay;
        this.notifications = state.data.page.content;
        this.countNotifications = state.data.unread;
        if (this.countNotifications > 9) {
          this.plusNotification = '+9';
        }
      }
    });
  }

  private getNotifications(): void {
    if (!this.countNotifications) {
      const payload = {
        active: 'date',
        direction: 'desc',
        page: 0
      };
      this.store.dispatch(
        new fromActionsNotification.GetAllPaged(payload)
      );
    }
  }
}
