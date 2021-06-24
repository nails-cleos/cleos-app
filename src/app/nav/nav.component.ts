import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectNotificationState } from '../store/app.states';
import { IMenu, IUser, IUserAll } from '../interfaces/user';
import * as fromActionsLogin from '../store/auth.actions';
import * as fromActionsNotification from '../store/notification.actions';
import { INotification } from '../interfaces/notification';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../interfaces/token';
import { MessagingService } from '../services/messaging.service';
import { environment } from '../../environments/environment';
import { getUserImage, getUserName, getUserNameInitials } from '../util/helper';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  title = environment.title;

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
  isProfessional = false;
  message: any;

  image: string | undefined;
  initials: string | undefined;
  countNotifications = 0;
  plusNotification: string | undefined;

  constructor(public translate: TranslateService, private breakpointObserver: BreakpointObserver, private router: Router,
              private store: Store<AppState>, private messagingService: MessagingService) {
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
  }

  notification(notification: INotification): void {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      if (this.countNotifications > 0) {
        this.countNotifications--;
      }
      if (this.countNotifications < 10) {
        this.plusNotification = undefined;
      }
      this.notifications.forEach(value => {
        if (value.id === notification.id) {
          return Object.assign({}, value, {read: true});
        }
        return value;
      });
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
        const user: IUserAll = state.user;
        this.currentUser = user;
        this.isProfessional = user.authorities.some(u => u.authority === Role.professional);
        this.menuItems = state.menus;
        this.canChangePassword = user?.provider === 'LOCAL';
        this.username = getUserName(user);
        this.initials = getUserNameInitials(user);
        this.image = getUserImage(user);
        this.messagingService.requestPermission(user.id);
        this.messagingService.receiveMessage();
        this.message = this.messagingService.currentMessage.subscribe((value: any) => {
          if (value) {
            const notification = {
              id: value.data.id,
              message: value.title,
              date: value.data.date,
              navigation: value.data.navigation,
              read: false
            } as INotification;

            this.notifications = [notification].concat(this.notifications);
            if (this.notifications.length > 9) {
              this.notifications.splice(-1, 1);
            }
            this.countNotifications++;
            if (this.countNotifications > 9) {
              this.plusNotification = '+9';
            }
          }
        });
      }
      if (this.router.url === '/') {
        this.router.navigate([this.isAuthorized ? 'redirect' : 'main']);
      }
    });

    this.notificationSubscription = this.getNotificationState.subscribe((state) => {
      if (state.data && state.data.page && state.data.page.content[0].id) {
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
