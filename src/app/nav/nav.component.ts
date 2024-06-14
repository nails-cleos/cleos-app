import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  AppState,
  selectAccountState,
  selectAdditionalState,
  selectAuthState,
  selectCatalogueState,
  selectColorState,
  selectCurrencyState,
  selectDiscountState,
  selectExpenseState,
  selectNoteState,
  selectNotificationState,
  selectOfficeState,
  selectPaymentState,
  selectReservationState,
  selectRoomState,
  selectTreatmentState,
  selectUnavailableState,
  selectUserState
} from '../store/app.states';
import { IMenu, IUser, IUserAll, User } from '../interfaces/user';
import * as fromActionsLogin from '../store/auth.actions';
import * as fromActionsNotification from '../store/notification.actions';
import * as fromActionsUser from '../store/user.actions';
import { INotification } from '../interfaces/notification';
import { TranslateService } from '@ngx-translate/core';
import { MessagingService } from '../services/messaging.service';
import { environment } from '../../environments/environment';
import { getDisplayNameInitials, getLocale, getUserImage } from '../util/helper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationService } from '../services/navigation.service';
import { TokenService } from '../services/token.service';
import { CookieService } from 'ngx-cookie-service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { getThemeName, isDarkMode, resetTheme, Theme, THEME } from '../util/theme';
import { ThemeService } from 'ng2-charts';
import { AuthUserService } from '../services/auth-user.service';
import { SeoService } from '../services/seo.service';
import { newDateTimestamp } from '../util/dates';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  title = environment.title;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches), shareReplay());

  menuItems: IMenu[] = [];
  notifications: INotification[] = [];
  workDay: INotification[] = [];
  currentUser!: IUser | null;

  showInformation = true;

  dateFormat: string;

  isProfessional = false;
  isManager = false;
  isAdmin = false;

  image?: string;
  initials?: string;
  countNotifications = 0;
  plusNotification?: string;

  isLoading = true;
  error: any;
  incomplete = false;

  isDarkMode = false;
  step = 0;
  language: string;

  private getState: Observable<any>;
  private getNotificationState: Observable<any>;
  private authSubscription?: Subscription;
  private notificationSubscription?: Subscription;
  private isAuthorized = false;
  private cssClass?: string;
  private authSubject: Subject<boolean> = new Subject<boolean>();

  constructor(public translate: TranslateService, private breakpointObserver: BreakpointObserver,
              private router: Router, private store: Store<AppState>, private messagingService: MessagingService,
              private snackBar: MatSnackBar, private navigationService: NavigationService, private tokenService: TokenService,
              private cookieService: CookieService, private overlayContainer: OverlayContainer,
              private themeService: ThemeService, private authUserService: AuthUserService,
              private seoService: SeoService, private route: ActivatedRoute) {
    this.isDarkMode = isDarkMode(cookieService.get(THEME) as Theme);
    this.dateFormat = this.translate.currentLang;
    this.language = this.translate.currentLang;
    this.getState = this.store.select(selectAuthState);
    this.getNotificationState = this.store.select(selectNotificationState);
    this.selectStore([selectRoomState, selectTreatmentState, selectCatalogueState, selectDiscountState, selectUnavailableState,
      selectUserState, selectReservationState, selectPaymentState, selectAdditionalState, selectCurrencyState, selectOfficeState,
      selectColorState, selectExpenseState, selectNoteState, selectAccountState]);
    this.navigationService.subscribe();
  }

  get goToHome(): void {
    this.router.navigate([this.language]);
    return;
  }

  get logout(): void {
    return this.store.dispatch(
      new fromActionsLogin.LogOut()
    );
  }

  get changeTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme: Theme = getThemeName(this.isDarkMode);
    this.resetTheme(theme);
    const user: IUser = new User();
    user.theme = theme;
    const redirectUrl = this.router.url;
    const message = this.translate.instant(`COMMON.PROFILE.UPDATED.DARK_MODE_${ this.isDarkMode.toString().toUpperCase() }`);
    return this.store.dispatch(
      new fromActionsUser.UpdateUser({ user, redirectUrl, message })
    );
  }

  ngOnInit(): void {
    this.subscribe();
    this.getNotifications();
    this.authUserService.cookieConsent(this.translate);

    const meta = this.translate.instant('DASHBOARD.META');

    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);

    this.language = this.navigationService.attachLang(this.route.snapshot.paramMap.get('lang'));
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
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
      this.notifications = this.notifications.map(value => {
        if (value.id === notification.id) {
          return Object.assign({}, value, { read: true });
        }
        return value;
      });
      this.store.dispatch(
        new fromActionsNotification.NotificationRead(notification)
      );
    }
  }

  navigate(menu: IMenu, drawer?: any): void {
    drawer?.toggle();
    this.error = undefined;
    this.router.navigate([this.language].concat(menu.path.split('/')));
  }

  private selectStore(states: any[]): void {
    states.forEach(selectedState => this.store.select(selectedState).subscribe((state: any) => {
      this.isLoading = state.isLoading;
      if (!state.subErrors) {
        this.error = state.error;
        if (state.errorMessage || state.message) {
          const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
            duration: 5000
          });
          if (state.reload) {
            snackBarRef.afterDismissed().subscribe(() => this.navigationService.reload(this.router.url.split('/')));
          }
        }
      }
    }));
  }

  private subscribe(): void {
    this.authSubscription = this.getState.subscribe(state => {
      this.isAuthorized = state.isAuthenticated;
      this.isLoading = state.isLoading;
      this.authSubject.next(this.isAuthorized);
      if (state.isAuthenticated) {
        const authUser = this.authUserService.reloadUser(state.user);
        this.showInformation = !authUser.isRoomAdmin;
        this.isDarkMode = authUser.isDarkMode;
        this.isProfessional = authUser.isProfessional;
        this.isManager = authUser.isManager;
        this.isAdmin = authUser.isAdmin;
        this.tokenService.token = state.token;
        this.tokenService.user = state.user;
        this.incomplete = !state.user.completed;
        const user: IUserAll = state.user;
        this.language = this.navigationService.attachLang(getLocale(user.locale).language);
        this.currentUser = user;
        this.resetTheme(this.currentUser.theme);
        this.menuItems = state.menus;
        this.initials = getDisplayNameInitials(user);
        this.image = getUserImage(user);
        this.messagingService.requestPermission(user);
        this.messagingService.receiveMessage();
        this.messagingService.message$?.subscribe((value: any) => {
          if (value) {
            const notification = {
              id: value.data.id,
              message: value.notification.title,
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
            this.setBadge();
          }
        });
      }
      if (this.router.url === `/${ this.language }`) {
        if (this.isAuthorized && !state.redirect) {
          this.store.dispatch(
            new fromActionsLogin.Redirect()
          );
        } else {
          this.router.navigate(['/', this.language]);
        }
      }
    });

    this.notificationSubscription = this.getNotificationState.subscribe((state) => {
      if (state.data && state.data.page && state.data.page.content[0]?.id) {
        this.workDay = state.data.workDay;
        this.notifications = state.data.page.number === 0 ? state.data.page.content.map((it: INotification) =>
          Object.assign({}, it, { notDate: newDateTimestamp(it.date) })) : this.notifications;
        this.countNotifications = state.data.unread;
        this.updateCount();
      }
      if (state.dataDeleted?.deleted && !state.dataDeleted.read) {
        this.notifications = this.notifications.filter((it: INotification) => it.id !== state.dataDeleted.id);
        this.countNotifications = this.countNotifications - 1;
        this.updateCount();
      }
      this.isLoading = state.isLoading;
    });
  }

  private updateCount(): void {
    if (this.countNotifications > 9) {
      this.plusNotification = '+9';
    } else {
      this.plusNotification = undefined;
    }
    this.setBadge();
  }

  private setBadge(): void {
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      if (this.countNotifications) {
        (navigator as any).setAppBadge(this.countNotifications);
      } else {
        (navigator as any).clearAppBadge();
      }
    }
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

  private resetTheme(theme?: Theme): void {
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
  }
}
