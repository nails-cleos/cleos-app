import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterLinkActive, RouterOutlet } from '@angular/router';
import * as fromActionsLogin from '../store/auth.actions';
import { IUser, User } from '../interfaces/user';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { getThemeName, isDarkMode, resetTheme, Theme, THEME } from '../util/theme';
import { ThemeService } from 'ng2-charts';
import { bottomTop, colorChange, colorChangeChild, fade, goTo, observeElement } from '../util/animation';
import { Auth, user } from '@angular/fire/auth';
import { AuthUserService } from '../services/auth-user.service';
import { MainContentService } from './main-content.service';
import * as fromActionsMain from '../store/main.actions';
import { TokenService } from '../services/token.service';
import { NavigationService } from '../services/navigation.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [fade, bottomTop, colorChange, colorChangeChild],
  imports: [SharedModule, RouterOutlet, RouterLinkActive],
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bodySection', { static: true }) bodySection?: ElementRef<HTMLElement>;

  private breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private store: Store<AppState> = inject(Store<AppState>);
  private router: Router = inject(Router);
  private translate: TranslateService = inject(TranslateService);
  private overlayContainer: OverlayContainer = inject(OverlayContainer);
  private cookieService: CookieService = inject(CookieService);
  private themeService: ThemeService = inject(ThemeService);
  private auth: Auth = inject(Auth);
  private authUserService: AuthUserService = inject(AuthUserService);
  private mainContent: MainContentService = inject(MainContentService);
  private tokenService: TokenService = inject(TokenService);
  private navigationService: NavigationService = inject(NavigationService);
  private route: ActivatedRoute = inject(ActivatedRoute);

  navigationState: BehaviorSubject<'open' | 'close'> = new BehaviorSubject<'open' | 'close'>('close');

  title = environment.title;
  firstSection?: Element | null;
  showLoader: boolean = true;
  isAuthenticated: boolean = false;
  appVersion = environment.version;

  cssClass?: string;
  isDarkMode: boolean = isDarkMode(this.cookieService.get(THEME) as Theme);
  backgroundColor: string = this.isDarkMode ? '126, 119, 105' : '169, 163, 151';
  language: string = this.translate.currentLang;
  showArrow: boolean = false;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  	.pipe(map(result => result.matches), shareReplay());

  private navigationObserve?: IntersectionObserver;

  private destroy$ = new Subject<void>();

  constructor() {
  	this.authUserService.updateMode(this.isDarkMode);
  }

  ngOnInit(): void {
  	this.authUserService.cookieConsent(this.translate);
  	this.language = this.navigationService.attachLang(this.route.snapshot.paramMap.get('lang'));

    user(this.auth)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        response?.getIdToken().then((idToken) => (this.tokenService.token = idToken));
        this.isAuthenticated = response !== null;
      });

    this.mainContent.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe((it) => {
        this.showLoader = it.showPreload;
        this.navigationState.next(it.navigationHeader);
        this.showArrow = it.showArrow;
      });
  }

  ngAfterViewInit(): void {
  	this.navigationAnimation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme: Theme = getThemeName(this.isDarkMode);
    this.resetTheme(theme);
    if (this.isAuthenticated) {
      const authenticatedUser: IUser = new User();
      authenticatedUser.theme = theme;
      const redirectUrl = this.router.url;
      const message = this.translate.instant(
        `COMMON.PROFILE.UPDATED.DARK_MODE_${ this.isDarkMode.toString().toUpperCase() }`);
      this.store.dispatch(
        new fromActionsMain.UpdateMyUser(authenticatedUser, redirectUrl, message),
      );
    }
    return;
  }

  redirect(): void {
    return this.store.dispatch(
      new fromActionsLogin.Redirect(),
    );
  }

  treatment(): void {
    goTo('home');
    this.router.navigate([this.translate.currentLang, 'biab', 'treatment']);
    return;
  }

  scrollToElement = (element: HTMLElement | string): void => {
  	this.router.navigate(['/', this.language]).then(() => setTimeout(() => {
  		this.navigationAnimation();
  		goTo(element);
  	}, 100));
  };

  private resetTheme = (theme?: Theme): void => {
  	this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
  	this.authUserService.updateMode(isDarkMode(theme));
  	this.backgroundColor = this.isDarkMode ? '126, 119, 105' : '169, 163, 151';
  };

  private navigationAnimation = (): void => {
  	this.navigationObserve?.disconnect();
  	this.firstSection = window.document.getElementById('slider');
  	this.navigationObserve = observeElement(this.navigationState, this.firstSection, true, 0.1);
  };
}
