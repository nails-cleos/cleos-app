import { AfterViewInit, Component, ElementRef, OnDestroy, Optional, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import * as fromActionsLogin from '../store/auth.actions';
import { IUser, User } from '../interfaces/user';
import * as fromActionsUser from '../store/user.actions';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { getThemeName, isDarkMode, resetTheme, Theme, THEME } from '../util/theme';
import { ThemeService } from 'ng2-charts';
import { bottomTop, colorChange, colorChangeChild, fade, goTo, observeElement } from '../util/animation';
import { Auth, user } from '@angular/fire/auth';
import { AuthUserService } from '../services/auth-user.service';
import { MainContentService } from './main-content.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [fade, bottomTop, colorChange, colorChangeChild]
})
export class MainComponent implements AfterViewInit, OnDestroy {

  @ViewChild('bodySection', { static: true }) bodySection?: ElementRef<HTMLElement>;
  navigationState: BehaviorSubject<'open' | 'close'>;

  title = environment.title;
  firstSection?: Element | null;
  showLoader: boolean;
  isAuthenticated: boolean;
  appVersion = environment.version;

  cssClass?: string;
  isDarkMode: boolean;
  backgroundColor: string;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches), shareReplay());

  private authUserServiceSubscription: Subscription;
  private mainContentSubscription: Subscription;

  private navigationObserve?: IntersectionObserver;

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private viewportScroller: ViewportScroller, private router: Router, private translate: TranslateService,
              private overlayContainer: OverlayContainer, private cookieService: CookieService,
              private themeService: ThemeService, @Optional() private auth: Auth, private authUserService: AuthUserService,
              private mainContent: MainContentService) {
    this.navigationState = new BehaviorSubject<'open' | 'close'>('open');
    this.isAuthenticated = false;
    this.showLoader = true;
    this.isDarkMode = isDarkMode(cookieService.get(THEME) as Theme);
    this.authUserService.updateMode(this.isDarkMode);
    this.backgroundColor = this.isDarkMode ? '126, 119, 105' : '169, 163, 151';
    this.authUserServiceSubscription = user(this.auth).subscribe(response => this.isAuthenticated = response !== null);
    this.mainContentSubscription = mainContent.data$.subscribe(it => this.showLoader = it);
  }

  get changeTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme: Theme = getThemeName(this.isDarkMode);
    this.resetTheme(theme);
    if (this.isAuthenticated) {
      const authenticatedUser: IUser = new User();
      authenticatedUser.theme = theme;
      const redirectUrl = this.router.url;
      const message = this.translate.instant(`COMMON.PROFILE.UPDATED.DARK_MODE_${ this.isDarkMode.toString().toUpperCase() }`);
      this.store.dispatch(
        new fromActionsUser.UpdateUser({ user: authenticatedUser, redirectUrl, message })
      );
    }
    return;
  }

  get redirect(): void {
    return this.store.dispatch(
      new fromActionsLogin.Redirect()
    );
  }

  ngAfterViewInit(): void {
    this.navigationAnimation();
  }

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
    this.mainContentSubscription.unsubscribe();
  }

  scrollToElement(element: HTMLElement | string): void {
    this.router.navigate(['/', 'main']).then(() => setTimeout(() => {
      this.navigationAnimation();
      goTo(element);
    }, 100));
  }

  private resetTheme(theme?: Theme): void {
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
    this.authUserService.updateMode(isDarkMode(theme));
    this.backgroundColor = this.isDarkMode ? '126, 119, 105' : '169, 163, 151';
  }

  private navigationAnimation(): void {
    this.navigationObserve?.disconnect();
    this.firstSection = window.document.getElementById('slider');
    this.navigationObserve = observeElement(this.navigationState, this.firstSection, true, 0.1);
  }
}
