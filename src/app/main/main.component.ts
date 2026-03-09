import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NavigationEnd, Router, RouterLinkActive, RouterOutlet } from '@angular/router';
import { redirect } from '../store/auth.actions';
import { IUser, User } from '../interfaces/user';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { getThemeName, isDarkMode, resetTheme, Theme, THEME } from '../util/theme';
import { ThemeService } from 'ng2-charts';
import { goTo, observeElementSignal } from '../util/animation';
import { Auth, user } from '@angular/fire/auth';
import { AuthUserService } from '../services/auth-user.service';
import { MainContentService } from '../services/main-content.service';
import { updateMyUser } from '../store/main.actions';
import { NavigationService } from '../services/navigation.service';
import { SharedModule } from '../shared/shared.module';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { getCurrentLangPipe } from '../store/selectors/main.selectors';
import { MainState } from '../store/reducers/main.reducers';
import { EnvService } from '../services/env.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [SharedModule, RouterOutlet, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  private readonly env: EnvService = inject(EnvService);
  private readonly breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly store: Store<MainState> = inject(Store<MainState>);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly overlayContainer: OverlayContainer = inject(OverlayContainer);
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly themeService: ThemeService = inject(ThemeService);
  private readonly auth: Auth = inject(Auth);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly mainContent: MainContentService = inject(MainContentService);
  private readonly navigationService: NavigationService = inject(NavigationService);

  private authUserSignal = this.authUserService.authUser;
  private lang$ = this.store.pipe(getCurrentLangPipe);
  private breakpointObserver$ = this.breakpointObserver.observe([Breakpoints.Handset]);

  private langSignal = toSignal(this.lang$);
  private userSignal = toSignal(user(this.auth), { initialValue: null });
  private breakpointsSignal = toSignal(
    this.breakpointObserver$, {
      initialValue: {
        matches: false,
        breakpoints: {
          [Breakpoints.Handset]: false,
        },
      },
    },
  );

  navigationState = signal<'open' | 'close'>('close');

  isHandsetSignal = computed(() => this.breakpointsSignal()?.matches ?? false);
  isDarkMode = signal(isDarkMode(this.cookieService.get(THEME) as Theme));
  isAuthenticated = computed(() => !!this.userSignal());

  title = this.env.title;
  firstSection?: Element | null;
  showLoader: boolean = true;
  appVersion = this.env.version;

  cssClass?: string;
  backgroundColor = computed(() => this.isDarkMode() ? '126, 119, 105' : '169, 163, 151');
  language: string = this.translate.getCurrentLang();
  showArrow: boolean = false;

  private navigationObserve?: IntersectionObserver;

  constructor() {
    this.authUserService.updateMode(this.isDarkMode());

    let lastDarkMode: boolean | undefined;
    effect(() => {
      const isDark = this.isDarkMode();
      this.authUserService.updateMode(isDark);
      const theme: Theme = getThemeName(isDark);
      this.resetTheme(theme);
    });

    effect(() => {
      const isDark = this.authUserSignal().isDarkMode;
      if (isDark !== this.isDarkMode()) {
        this.isDarkMode.set(isDark);
      }
    });

    effect(() => {
      const isDark = this.isDarkMode();
      if (lastDarkMode === isDark) {
        return;
      }
      lastDarkMode = isDark;
      if (this.isAuthenticated()) {
        const theme: Theme = getThemeName(isDark);
        const authenticatedUser: IUser = new User();
        authenticatedUser.theme = theme;
        const redirectUrl = this.router.url;
        const message = this.translate.instant(
          `COMMON.PROFILE.UPDATED.DARK_MODE_${isDark.toString().toUpperCase()}`);
        this.store.dispatch(
          updateMyUser({ user: authenticatedUser, redirectUrl, message }),
        );
      }
    });

    effect(() => {
      const state = this.mainContent.value;
      this.showLoader = state.showPreload;
      this.navigationState.set(state.navigationHeader);
      this.showArrow = state.showArrow;
    });

    effect(() => {
      const lang = this.langSignal();
      this.authUserService.cookieConsent(this.translate);
      this.language = this.navigationService.attachLang(lang);
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => setTimeout(() => this.navigationAnimation(), 0));
  }

  changeTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }

  redirect(): void {
    return this.store.dispatch(redirect());
  }

  treatment(): void {
    goTo('home');
    this.router.navigate([this.translate.getCurrentLang(), 'home', 'biab', 'treatment']);
    return;
  }

  scrollToElement = (element: HTMLElement | string): void => {
    this.router.navigate(['/', this.language]).then(() => setTimeout(() => {
      this.navigationAnimation();
      goTo(element);
    }, 100));
  };

  private resetTheme = (theme?: Theme): void => {
    this.cssClass = resetTheme(this.overlayContainer, this.cookieService, this.themeService, theme, this.cssClass);
    this.authUserService.updateMode(isDarkMode(theme));
  };

  private navigationAnimation = (): void => {
    this.navigationObserve?.disconnect();
    this.firstSection = window.document.getElementById('slider');
    this.navigationObserve = observeElementSignal(this.navigationState, this.firstSection, true, 0.1);
  };
}
