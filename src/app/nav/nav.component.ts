import { Component, computed, effect, ElementRef, HostListener, inject, signal, untracked, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IUser, User } from '../user/user';
import { INotification } from '../notification/notification';
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
import { DEFAULT_LOCALE, newDateTimestamp } from '../util/dates';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { ErrorComponent } from '../shared/error/error.component';
import { ToastService } from '../services/toast.service';
import { PAGE_SIZE } from '../interfaces/pagination';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ToastOptions } from '../shared/toast/toast.model';
import { IResponseSuccess } from '../interfaces/common';
import { EnvService } from '../services/env.service';
import { LoadingOverlayService } from '../services/loading-overlay.service';
import { GLOBAL_FEEDBACK_SOURCE, GlobalFeedbackSource } from '../store/global-feedback-source';
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
import { UserStore } from '../store/user.store';
import { NotificationStore } from '../store/notification.store';
import { AuthStore } from '../store/auth.store';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatListItem, MatIconButton, MatButton, TranslatePipe, RouterLink, DatePipe,
    MatTooltip, MatListItemIcon, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent,
    MenuItemComponent, RouterLinkActive, RouterOutlet, ErrorComponent, MatProgressSpinner, MatDrawerContainer,
    MatDrawer, AvatarComponent, UpperCasePipe, MatDivider, MatNavList, MatDrawerContent, MatToolbar, MatBadge],
})
export class NavComponent {
  private readonly elementRef: ElementRef = inject(ElementRef);
  private readonly env: EnvService = inject(EnvService);
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly router: Router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly notificationStore = inject(NotificationStore);
  private readonly messagingService: MessagingService = inject(MessagingService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly overlayContainer: OverlayContainer = inject(OverlayContainer);
  private readonly themeService: ThemeService = inject(ThemeService);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly seoService: SeoService = inject(SeoService);
  private readonly loadingService = inject(LoadingOverlayService);
  private readonly feedbackSources = inject(GLOBAL_FEEDBACK_SOURCE, { optional: true }) ?? [];
  private readonly userStore = inject(UserStore);

  private breakpointObserver$ = this.breakpointObserver.observe(
    [Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium]);

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

  private isAuthenticatedSignal = this.authStore.isAuthenticated;
  private redirectSignal = this.authStore.redirect;
  private menuItemsSignal = this.authStore.menus;
  private notificationSignal = computed(() => this.notificationStore.data());
  private dataDeletedSignal = computed(() => this.notificationStore.dataDeleted());
  private dataReadSignal = computed(() => this.notificationStore.dataRead());
  private messageSignal = toSignal(this.messagingService.message$ ?? of(undefined));
  private readonly feedbackResponse = computed(() => this.findFeedbackSource(source => source.response()));
  private readonly feedbackError = computed(() => this.findFeedbackSource(source => source.error()));

  currentUserSignal = this.authStore.user;

  private authUserSignal = this.authUserService.authUser;
  private isAuthorized = computed(() => this.isAuthenticatedSignal() ?? false);
  private readonly isBlockingPageError = (error?: { status?: string }) =>
    ['NOT_FOUND', 'SERVER_ERROR'].includes(error?.status || '');

  isHandsetSignal = computed(() => this.breakpointsSignal()?.matches ?? false);
  showInformation = computed(() => !this.authUserSignal()?.isRoomAdmin);
  isAdmin = computed(() => this.authUserSignal()?.isAdmin ?? false);
  isProfessional = computed(() => this.authUserSignal()?.isProfessional ?? false);
  isManager = computed(() => this.authUserSignal()?.isManager ?? false);
  menuItems = computed(() => this.menuItemsSignal() || []);

  private readonly language = toSignal(this.navigationService.urlLanguage$, { initialValue: DEFAULT_LOCALE });

  readonly languageSignal = computed(() => {
    const user = this.currentUserSignal();

    return getLocale(user?.locale || this.language()).language;
  });

  isDarkMode = signal(this.authUserSignal().isDarkMode || isDarkMode(this.cookieService.get(THEME) as Theme));
  pageError = computed(() => {
    const error = this.feedbackError()?.value;
    return this.isBlockingPageError(error) ? error : undefined;
  });
  notifications = signal<INotification[]>([]);
  workDay = signal<INotification[]>([]);
  countNotifications = signal(0);
  activeMenu = signal<'notifications' | 'workday' | 'settings' | null>(null);

  readonly loading = this.loadingService.isLoading;

  image = signal<string | undefined>(undefined);
  initials?: string;
  plusNotification?: string;
  incomplete = false;
  step = 0;

  private cssClass?: string;

  constructor() {
    this.authUserService.cookieConsent(this.translateService);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const feedbackError = this.findFeedbackSource(source => source.error());

        if (this.isBlockingPageError(feedbackError?.value)) {
          feedbackError?.source.clearError();
        }
      }
    });

    const meta = this.translateService.instant('DASHBOARD.META');
    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);

    effect(() => {
      const response = this.feedbackResponse()?.value;
      if (!response) {
        return;
      }

      if (response.redirect) {
        this.navigationService.navigate([response.redirect]);
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
          this.navigationService.reload();
        }
      }
    });

    effect(() => {
      const feedbackError = this.feedbackError();
      const err = feedbackError?.value;
      if (!err?.message) {
        return;
      }

      this.toastService.show(err.message, 'error');

      if (!this.isBlockingPageError(err)) {
        feedbackError?.source.clearError();
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
          this.image.set(getUserImage(user));
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
      const language = this.languageSignal();
      if (isAuthorized) {
        this.notificationStore.loadPage({ page: 0, sort: 'date', direction: 'desc', size: PAGE_SIZE });
      } else {
        this.navigationService.resetConfig(language);
      }
      if (this.router.url === `/${ language }`) {
        if (isAuthorized && !redirectSignal) {
          this.authStore.authRedirect();
        } else {
          this.navigationService.navigate(['home']);
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
    this.navigationService.navigate(['home']);
  }

  logout() {
    this.authStore.logOut();
  }

  changeTheme() {
    this.isDarkMode.update(prev => !prev);
    const theme = getThemeName(this.isDarkMode());
    this.resetTheme(theme);
    this.authUserService.updateMode(this.isDarkMode());
    if (this.isAuthorized()) {
      const user: IUser = new User();
      user.theme = theme;
      const redirectUrl = this.router.url;
      const message = this.translateService.instant(
        `COMMON.PROFILE.UPDATED.DARK_MODE_${ this.isDarkMode().toString().toUpperCase() }`);
      this.userStore.updateMyUser(user, redirectUrl, message);
    }
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
      this.notificationStore.read(notification.id);
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
      // TODO if we change the href link we need to remove the language here.
      return { actionType: 'link', action: `/${ this.languageSignal() }/${ res.path }` };
    }
    return { actionType: 'none' };
  };

  private findFeedbackSource = <T>(
    read: (source: GlobalFeedbackSource) => T | undefined,
  ): { source: GlobalFeedbackSource; value: T } | undefined => {
    for (const source of this.feedbackSources) {
      const value = read(source);
      if (value !== undefined) {
        return { source, value };
      }
    }

    return undefined;
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
