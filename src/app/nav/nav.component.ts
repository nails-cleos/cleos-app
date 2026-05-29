import { Component, computed, effect, ElementRef, HostListener, inject, signal, untracked } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { IUser, User } from '../interfaces/user';
import { logOut, redirect } from '../store/auth.actions';
import { getNotificationsPage, readNotification } from '../store/notification.actions';
import { updateMyUser } from '../store/user.actions';
import { INotification } from '../interfaces/notification';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessagingService } from '../services/messaging.service';
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
import { MenuItemComponent } from './menu-item/menu-item.component';
import { ErrorComponent } from '../shared/error/error.component';
import { ToastService } from '../services/toast.service';
import { PAGE_SIZE } from '../interfaces/pagination';
import { toSignal } from '@angular/core/rxjs-interop';
import { getIsAuthenticatedPipe, getMenusPipe, getRedirectPipe, getUserPipe } from '../store/selectors/auth.selectors';
import { getDataDeletedPipe, getDataReadPipe, getNotificationsPipe } from '../store/selectors/notification.selectors';
import { of } from 'rxjs';
import { selectGlobalError, selectGlobalResponse } from '../store/selectors/global.selectors';
import { ToastOptions } from '../shared/toast/toast.model';
import { IResponseSuccess } from '../interfaces/common';
import { EnvService } from '../services/env.service';
import { LoadingOverlayService } from '../services/loading-overlay.service';
import { clearGlobalError, clearGlobalResponse } from '../store/global.actions';
import { MatIcon } from '@angular/material/icon';
import { MatDivider, MatListItem, MatListItemIcon, MatNavList } from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { AvatarComponent } from '../shared/avatar/avatar.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatBadge } from '@angular/material/badge';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [MatIcon, MatListItem, MatIconButton, MatButton, TranslatePipe, RouterLink, DatePipe,
    MatTooltip, MatListItemIcon, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent,
    MenuItemComponent, RouterLinkActive, RouterOutlet, ErrorComponent, MatProgressSpinner, MatDrawerContainer,
    MatDrawer, AvatarComponent, UpperCasePipe, MatDivider, MatNavList, MatDrawerContent, MatToolbar, MatBadge],
})
export class NavComponent {
  private readonly elementRef: ElementRef = inject(ElementRef);
  private readonly env: EnvService = inject(EnvService);
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
  private readonly loadingService = inject(LoadingOverlayService);

  private breakpointObserver$ = this.breakpointObserver.observe(
    [Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium]);
  private isAuthenticated$ = this.store.pipe(getIsAuthenticatedPipe);
  private user$ = this.store.pipe(getUserPipe);
  private menus$ = this.store.pipe(getMenusPipe);
  private redirect$ = this.store.pipe(getRedirectPipe);
  private dataDeleted$ = this.store.pipe(getDataDeletedPipe);
  private dataRead$ = this.store.pipe(getDataReadPipe);
  private notification$ = this.store.pipe(getNotificationsPipe);

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

  title = this.env.title;

  private isAuthenticatedSignal = toSignal(this.isAuthenticated$);
  private redirectSignal = toSignal(this.redirect$);
  private menuItemsSignal = toSignal(this.menus$);
  private dataDeletedSignal = toSignal(this.dataDeleted$);
  private dataReadSignal = toSignal(this.dataRead$);
  private notificationSignal = toSignal(this.notification$);
  private messageSignal = toSignal(this.messagingService.message$ ?? of(undefined));
  private globalResponseSignal = toSignal(this.store.select(selectGlobalResponse));
  private globalErrorSignal = toSignal(this.store.select(selectGlobalError));

  currentUserSignal = toSignal(this.user$);

  private authUserSignal = this.authUserService.authUser;
  private isAuthorized = computed(() => this.isAuthenticatedSignal() ?? false);
  private readonly response = computed(() => this.globalResponseSignal());
  private readonly isBlockingPageError = (error?: { status?: string }) =>
    ['NOT_FOUND', 'SERVER_ERROR'].includes(error?.status || '');

  isHandsetSignal = computed(() => this.breakpointsSignal()?.matches ?? false);
  showInformation = computed(() => !this.authUserSignal()?.isRoomAdmin);
  isAdmin = computed(() => this.authUserSignal()?.isAdmin ?? false);
  isProfessional = computed(() => this.authUserSignal()?.isProfessional ?? false);
  isManager = computed(() => this.authUserSignal()?.isManager ?? false);
  menuItems = computed(() => this.menuItemsSignal() || []);

  readonly language = computed(() => {
    const user = this.currentUserSignal();

    return getLocale(
      user?.locale || this.route.snapshot.paramMap.get('lang') || this.translate.getCurrentLang()).language;
  });

  isDarkMode = signal(this.authUserSignal().isDarkMode || isDarkMode(this.cookieService.get(THEME) as Theme));
  pageError = computed(() => {
    const error = this.globalErrorSignal();
    return this.isBlockingPageError(error) ? error : undefined;
  });
  notifications = signal<INotification[]>([]);
  workDay = signal<INotification[]>([]);
  countNotifications = signal(0);
  activeMenu = signal<'notifications' | 'workday' | 'settings' | null>(null);

  readonly loading = this.loadingService.isLoading;

  dateFormat: string = this.translate.getCurrentLang();
  image?: string;
  initials?: string;
  plusNotification?: string;
  incomplete = false;
  step = 0;

  private cssClass?: string;

  constructor() {
    this.authUserService.cookieConsent(this.translate);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.isBlockingPageError(this.globalErrorSignal())) {
        this.store.dispatch(clearGlobalError());
      }
    });

    const meta = this.translate.instant('DASHBOARD.META');
    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);

    effect(() => {
      const response = this.response();
      if (!response) {
        return;
      }

      if (response.redirect) {
        this.router.navigate([`/${ this.language() }/${ response.redirect }`]);
      }

      if (response.blob) {
        const url = URL.createObjectURL(response.blob);

        // download
        const a = document.createElement('a');
        a.href = url;
        a.download = response.fileName;
        a.click();

        URL.revokeObjectURL(url);
      }

      if (response.message) {
        const options = this.getToastOptions(response);
        this.toastService.show(response.message, response.toastType, 5000, options);
        if (response.reload) {
          this.navigationService.reload(this.router.url.split('/'));
        }
      }

      this.store.dispatch(clearGlobalResponse());
    });

    effect(() => {
      const err = this.globalErrorSignal();
      if (!err?.message) {
        return;
      }

      this.toastService.show(err.message, 'error');

      if (!this.isBlockingPageError(err)) {
        this.store.dispatch(clearGlobalError());
      }
    });

    effect(() => {
      const user = this.currentUserSignal();
      if (user !== undefined) {
        this.authUserService.reloadUser(user);
      }
    });

    effect(() => {
      const authorized = this.isAuthorized();
      if (authorized) {
        const user = this.currentUserSignal();
        if (user) {
          this.tokenService.setUser = user;
          this.incomplete = !user.completed;
          this.initials = getDisplayNameInitials(user);
          this.image = getUserImage(user);
          this.messagingService.requestPermission(user);
          this.resetTheme(user.theme);
        }
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
      if (isAuthorized) {
        this.store.dispatch(getNotificationsPage({ page: 0, sort: 'date', direction: 'desc', size: PAGE_SIZE }));
      }
      if (this.router.url === `/${ language }`) {
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
      const readNotification = this.dataReadSignal();
      if (!readNotification) {
        return;
      }

      untracked(() => {
        const currentNotifications = this.notifications();
        const target = currentNotifications.find(it => it.id === readNotification.id);
        const shouldDecreaseCounter = !target || !target.read;

        if (target) {
          this.notifications.update(prev => prev.map(it => it.id === readNotification.id
            ? { ...it, read: true }
            : it));
        }

        if (shouldDecreaseCounter && this.countNotifications() > 0) {
          this.countNotifications.update(prev => prev - 1);
          this.updateCount();
        }
      });
    });

    effect(() => {
      const deleted = this.dataDeletedSignal();
      if (!deleted) {
        return;
      }

      if (!deleted.deleted) {
        return;
      }

      untracked(() => {
        if (this.notifications().some(n => n.id === deleted.id)) {
          this.notifications.update(prev => prev.filter(it => it.id !== deleted.id));
        }

        if (!deleted.read && this.countNotifications() > 0) {
          this.countNotifications.update(prev => prev - 1);
        }

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
    this.authUserService.updateMode(this.isDarkMode());
    const user: IUser = new User();
    user.theme = theme;
    const redirectUrl = this.router.url;
    const message = this.translate.instant(
      `COMMON.PROFILE.UPDATED.DARK_MODE_${ this.isDarkMode().toString().toUpperCase() }`);
    this.store.dispatch(updateMyUser({ user, redirectUrl, message }));
  }

  notification = (notification: INotification): void => {
    this.closeActiveMenu();
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

  private resetTheme = (theme?: Theme): void => {
    this.cssClass = resetTheme(this.overlayContainer, this.cookieService, this.themeService, theme, this.cssClass);
  };

  private getToastOptions = (res: IResponseSuccess): ToastOptions => {
    if (res.path) {
      return { actionType: 'link', action: `/${ this.language() }/${ res.path }` };
    }
    return { actionType: 'none' };
  };

  toggleMenu = (menu: 'notifications' | 'workday' | 'settings'): void => {
    this.activeMenu.update(current => current === menu ? null : menu);
  };

  closeActiveMenu = (): void => {
    this.activeMenu.set(null);
  };

  @HostListener('document:click', ['$event']) onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeActiveMenu();
    }
  }

  @HostListener('document:keydown.escape') onEscape(): void {
    this.closeActiveMenu();
  }
}
