import { Component, computed, effect, inject, OnDestroy, signal, untracked } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, Router, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { IUser, User } from '../interfaces/user';
import { logOut, redirect } from '../store/auth.actions';
import { getNotificationsPage, readNotification } from '../store/notification.actions';
import { updateMyUser } from '../store/user.actions';
import { INotification } from '../interfaces/notification';
import { TranslateService } from '@ngx-translate/core';
import { MessagingService } from '../services/messaging.service';
import { environment } from '../../environments/environment';
import { getDisplayNameInitials, getLocale, getUserImage } from '../util/helper';
import { NavigationService } from '../services/navigation.service';
import { TokenService } from '../services/token.service';
import { CookieService } from 'ngx-cookie-service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { getThemeName, isDarkMode, resetTheme, Theme, THEME } from '../util/theme';
import { ThemeService } from 'ng2-charts';
import { AuthUserService } from '../services/auth-user.service';
import { SeoService } from '../services/seo.service';
import { newDateTimestamp } from '../util/dates';
import { SharedModule } from '../shared/shared.module';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { ErrorComponent } from '../shared/error/error.component';
import { MatRipple } from '@angular/material/core';
import { IError, ResponseSuccess } from '../interfaces/common';
import { ToastService } from '../services/toast.service';
import { PAGE_SIZE } from '../interfaces/pagination';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  getIsAuthenticatedPipe,
  getIsLoadingPipe,
  getMenusPipe,
  getRedirectPipe,
  getTokenPipe,
  getUserPipe,
} from '../store/selectors/auth.selectors';
import {
  getDataDeletedPipe,
  getNotificationIsLoadingPipe,
  getNotificationsPipe,
} from '../store/selectors/notification.selectors';
import { Observable, of, Subject, takeUntil, UnaryFunction } from 'rxjs';
import { getRoomErrorPipe, getRoomIsLoadingPipe, getRoomResponsePipe } from '../store/selectors/room.selectors';
import {
  getTreatmentErrorPipe,
  getTreatmentIsLoadingPipe,
  getTreatmentResponsePipe,
} from '../store/selectors/treatment.selectors';
import {
  getCatalogueErrorPipe,
  getCatalogueIsLoadingPipe,
  getCatalogueResponsePipe,
} from '../store/selectors/catalogue.selectors';
import {
  getDiscountErrorPipe,
  getDiscountIsLoadingPipe,
  getDiscountResponsePipe,
} from '../store/selectors/discount.selectors';
import {
  getUnavailableErrorPipe,
  getUnavailableIsLoadingPipe,
  getUnavailableResponsePipe,
} from '../store/selectors/unavailable.selectors';
import { getUserErrorPipe, getUserIsLoadingPipe, getUserResponsePipe } from '../store/selectors/user.selectors';
import {
  getReservationErrorPipe,
  getReservationIsLoadingPipe,
  getReservationResponsePipe,
} from '../store/selectors/reservation.selectors';
import {
  getPaymentErrorPipe,
  getPaymentIsLoadingPipe,
  getPaymentResponsePipe,
} from '../store/selectors/payment.selectors';
import {
  getAdditionalErrorPipe,
  getAdditionalIsLoadingPipe,
  getAdditionalResponsePipe,
} from '../store/selectors/additional.selectors';
import {
  getCurrencyErrorPipe,
  getCurrencyIsLoadingPipe,
  getCurrencyResponsePipe,
} from '../store/selectors/currency.selectors';
import { getOfficeErrorPipe, getOfficeIsLoadingPipe, getOfficeResponsePipe } from '../store/selectors/office.selectors';
import { getColorErrorPipe, getColorIsLoadingPipe, getColorResponsePipe } from '../store/selectors/color.selectors';
import {
  getExpenseErrorPipe,
  getExpenseIsLoadingPipe,
  getExpenseResponsePipe,
} from '../store/selectors/expense.selectors';
import { getNoteErrorPipe, getNoteIsLoadingPipe, getNoteResponsePipe } from '../store/selectors/note.selectors';
import {
  getAccountErrorPipe,
  getAccountIsLoadingPipe,
  getAccountResponsePipe,
} from '../store/selectors/account.selectors';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [SharedModule, MenuItemComponent, RouterLinkActive, RouterOutlet, ErrorComponent, MatRipple],
})
export class NavComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);
  private readonly store: Store = inject(Store);
  private readonly messagingService: MessagingService = inject(MessagingService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly overlayContainer: OverlayContainer = inject(OverlayContainer);
  private readonly themeService: ThemeService = inject(ThemeService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly seoService: SeoService = inject(SeoService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private breakpointObserver$ = this.breakpointObserver.observe(
    [Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium]);
  private isAuthenticated$ = this.store.pipe(getIsAuthenticatedPipe);
  private user$ = this.store.pipe(getUserPipe);
  private token$ = this.store.pipe(getTokenPipe);
  private menus$ = this.store.pipe(getMenusPipe);
  private redirect$ = this.store.pipe(getRedirectPipe);
  private isLoading$ = this.store.pipe(getIsLoadingPipe);
  private dataDeleted$ = this.store.pipe(getDataDeletedPipe);
  private notification$ = this.store.pipe(getNotificationsPipe);
  private notificationIsLoading$ = this.store.pipe(getNotificationIsLoadingPipe);

  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.XSmall]: false,
          [Breakpoints.Small]: false,
          [Breakpoints.Medium]: false,
        },
      },
    },
  );

  title = environment.title;

  private isAuthenticatedSignal = toSignal(this.isAuthenticated$);
  private isLoadingSignal = toSignal(this.isLoading$);
  private redirectSignal = toSignal(this.redirect$);
  private tokenSignal = toSignal(this.token$);
  private menuItemsSignal = toSignal(this.menus$);
  private dataDeletedSignal = toSignal(this.dataDeleted$);
  private notificationSignal = toSignal(this.notification$);
  private notificationIsLoadingSignal = toSignal(this.notificationIsLoading$);
  private messageSignal = toSignal(this.messagingService.message$ ?? of(undefined));

  currentUserSignal = toSignal(this.user$);

  private authUserSignal = this.authUserService.authUser;
  private isAuthorized = computed(() => this.isAuthenticatedSignal() ?? false);

  isHandsetSignal = computed(() => this.breakpointsSignal()?.matches ?? false);
  showInformation = computed(() => !this.authUserSignal()?.isRoomAdmin);
  isAdmin = computed(() => this.authUserSignal()?.isAdmin ?? false);
  isProfessional = computed(() => this.authUserSignal()?.isProfessional ?? false);
  isManager = computed(() => this.authUserSignal()?.isManager ?? false);
  menuItems = computed(() => this.menuItemsSignal() || []);

  readonly language = computed(() => {
    const user = this.currentUserSignal();

    return getLocale(user?.locale || this.route.snapshot.paramMap.get('lang') || this.translate.currentLang).language;
  });


  isDarkMode = signal(this.authUserSignal().isDarkMode || isDarkMode(this.cookieService.get(THEME) as Theme));
  isLoading = signal((this.isLoadingSignal() || this.notificationIsLoadingSignal()) ?? true);
  notifications = signal<INotification[]>([]);
  workDay = signal<INotification[]>([]);
  countNotifications = signal(0);
  error = signal<IError | undefined>(undefined);

  dateFormat: string = this.translate.currentLang;
  image?: string;
  initials?: string;
  plusNotification?: string;
  incomplete = false;
  step = 0;

  private cssClass?: string;

  constructor() {
    this.registerFeature(getRoomResponsePipe, getRoomErrorPipe, getRoomIsLoadingPipe);
    this.registerFeature(getTreatmentResponsePipe, getTreatmentErrorPipe, getTreatmentIsLoadingPipe);
    this.registerFeature(getCatalogueResponsePipe, getCatalogueErrorPipe, getCatalogueIsLoadingPipe);
    this.registerFeature(getDiscountResponsePipe, getDiscountErrorPipe, getDiscountIsLoadingPipe);
    this.registerFeature(getUnavailableResponsePipe, getUnavailableErrorPipe, getUnavailableIsLoadingPipe);
    this.registerFeature(getUserResponsePipe, getUserErrorPipe, getUserIsLoadingPipe);
    this.registerFeature(getReservationResponsePipe, getReservationErrorPipe, getReservationIsLoadingPipe);
    this.registerFeature(getPaymentResponsePipe, getPaymentErrorPipe, getPaymentIsLoadingPipe);
    this.registerFeature(getAdditionalResponsePipe, getAdditionalErrorPipe, getAdditionalIsLoadingPipe);
    this.registerFeature(getCurrencyResponsePipe, getCurrencyErrorPipe, getCurrencyIsLoadingPipe);
    this.registerFeature(getOfficeResponsePipe, getOfficeErrorPipe, getOfficeIsLoadingPipe);
    this.registerFeature(getColorResponsePipe, getColorErrorPipe, getColorIsLoadingPipe);
    this.registerFeature(getExpenseResponsePipe, getExpenseErrorPipe, getExpenseIsLoadingPipe);
    this.registerFeature(getNoteResponsePipe, getNoteErrorPipe, getNoteIsLoadingPipe);
    this.registerFeature(getAccountResponsePipe, getAccountErrorPipe, getAccountIsLoadingPipe);

    this.navigationService.subscribe();
    this.authUserService.cookieConsent(this.translate);

    const meta = this.translate.instant('DASHBOARD.META');
    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);

    effect(() => {
      this.authUserService.reloadUser(this.currentUserSignal());
    });

    effect(() => {
      const authorized = this.isAuthorized();
      if (authorized) {
        const user = this.currentUserSignal();
        const token = this.tokenSignal();
        if (user && token) {
          this.tokenService.user = user;
          this.tokenService.token = token;
          this.incomplete = !user.completed;
          this.initials = getDisplayNameInitials(user);
          this.image = getUserImage(user);
          this.messagingService.requestPermission(user);
          this.resetTheme(user.theme);
        }
        this.messagingService.receiveMessage();
      }
    });

    effect(() => {
      const value = this.messageSignal();
      if (!value) {
        return;
      }

      const notification = {
        id: value.data.id,
        message: value.notification.title,
        date: value.data.date,
        navigation: value.data.navigation,
        read: false,
      } as INotification;


      untracked(() => {
        this.notifications.update(prev => {
          const next = [...prev, notification];
          return next.length > 9 ? next.slice(-9) : next;
        });

        this.countNotifications.update(c => c + 1);
        this.updateCount();
      });
    });

    effect(() => {
      const isAuthorized = this.isAuthorized();
      const redirectSignal = this.redirectSignal();
      const language = this.language();
      const token = this.tokenSignal();
      if (isAuthorized && token) {
        this.getNotifications();
      }
      if (this.router.url === `/${language}`) {
        if (isAuthorized && !redirectSignal) {
          this.store.dispatch(redirect());
        } else {
          this.router.navigate(['/', language, 'home']);
        }
      }
    });

    effect(() => {
      const notifications = this.notificationSignal();
      if (!notifications) {
        return;
      }

      if (notifications.page?.content?.length) {
        this.workDay.set(notifications.workDay);

        if (notifications.page.number === 0) {
          const updatedNotifications = notifications.page.content.map((it: INotification) =>
            Object.assign({}, it, { notDate: newDateTimestamp(it.date) }));
          this.notifications.set(updatedNotifications);
        }

        untracked(() => {
          this.countNotifications.set(notifications.unread);
          this.updateCount();
        });
      }
    });

    effect(() => {
      const deleted = this.dataDeletedSignal();
      if (!deleted) {
        return;
      }

      if (!this.notifications().some(n => n.id === deleted.id) || !deleted.deleted || deleted.read) {
        return;
      }

      untracked(() => {
        this.notifications.update(prev => prev.filter(it => it.id !== deleted.id));
        this.countNotifications.update(prev => prev - 1);
        this.updateCount();
      });
    });
  }

  goToHome() {
    this.router.navigate([this.language(), 'home']);
  }

  logout() {
    this.store.dispatch(logOut());
  }

  changeTheme() {
    this.isDarkMode.update(prev => !prev);
    const theme = getThemeName(this.isDarkMode());
    this.resetTheme(theme);
    const user: IUser = new User();
    user.theme = theme;
    const redirectUrl = this.router.url;
    const message = this.translate.instant(
      `COMMON.PROFILE.UPDATED.DARK_MODE_${this.isDarkMode().toString().toUpperCase()}`);
    this.store.dispatch(updateMyUser({ user, redirectUrl, message }));
  }

  notification = (notification: INotification): void => {
    if (notification.read) {
      this.router.navigate([notification.navigation]);
    } else {
      if (this.countNotifications() > 0) {
        this.countNotifications.update(prev => --prev);
      }
      if (this.countNotifications() < 10) {
        this.plusNotification = undefined;
      }
      this.notifications.update(prev => prev.map(value => {
        if (value.id === notification.id) {
          return Object.assign({}, value, { read: true });
        }
        return value;
      }));
      this.store.dispatch(readNotification({ id: notification.id }));
    }
  };

  private registerFeature(
    responsePipe: UnaryFunction<Observable<object>, Observable<ResponseSuccess>>,
    errorPipe: UnaryFunction<Observable<object>, Observable<IError>>,
    isLoadingPipe: UnaryFunction<Observable<object>, Observable<boolean>>,
  ) {
    // Loading
    this.store.pipe(isLoadingPipe, takeUntil(this.destroy$)).subscribe((loading) => {
      if (this.isLoading() !== loading) {
        this.isLoading.set(loading);
      }
    });

    // Error
    this.store.pipe(errorPipe, takeUntil(this.destroy$)).subscribe((error) => {
      if (!error) {
        return;
      }

      this.error.set(error);
      if (!error.message) {
        return;
      }
      this.toastService.error(error.message);
    });

    // Success response
    this.store.pipe(responsePipe, takeUntil(this.destroy$)).subscribe((response) => {
      if (!response) {
        return;
      }

      const path = response.path ? `/${this.language()}/${response.path}` : undefined;

      const toastRef = this.toastService.show(response.message, response.toastType, 5000, path ? 'link' : 'none', path);

      toastRef.onDismiss().subscribe(() => {
        if (response.reload) {
          this.navigationService.reload(this.router.url.split('/'));
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCount = (): void => {
    if (this.countNotifications() > 9) {
      this.plusNotification = '+9';
    } else {
      this.plusNotification = undefined;
    }
    this.setBadge();
  };

  private setBadge = (): void => {
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      const count = this.countNotifications();
      if (count > 0) {
        (navigator as any)?.setAppBadge(count);
      } else {
        (navigator as any)?.clearAppBadge();
      }
    }
  };

  private getNotifications = (): void => {
    if (!this.countNotifications()) {
      this.store.dispatch(getNotificationsPage({ page: 0, sort: 'date', direction: 'desc', size: PAGE_SIZE }));
    }
  };

  private resetTheme = (theme?: Theme): void => {
    this.cssClass = resetTheme(this.overlayContainer, this.cookieService, this.themeService, theme, this.cssClass);
  };
}
