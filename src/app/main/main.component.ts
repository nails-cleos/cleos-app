import { Component, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, Subscription } from 'rxjs';
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
import { AuthUserService } from '../services/auth-user.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnDestroy {
  title = environment.title;
  isAuthenticated = false;
  appVersion = environment.version;

  cssClass?: string;
  isDarkMode = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches), shareReplay());

  private authUserServiceSubscription: Subscription;

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private viewportScroller: ViewportScroller, private router: Router, private translate: TranslateService,
              private overlayContainer: OverlayContainer, private cookieService: CookieService,
              private themeService: ThemeService, private authUserService: AuthUserService) {
    this.isDarkMode = isDarkMode(cookieService.get(THEME) as Theme);
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      this.isAuthenticated = value.isAuthenticated;
      this.resetTheme(value.theme);
      this.isDarkMode = isDarkMode(cookieService.get(THEME) as Theme);
    });
  }

  get changeTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme: Theme = getThemeName(this.isDarkMode);
    this.resetTheme(theme);
    if (this.isAuthenticated) {
      const user: IUser = new User();
      user.theme = theme;
      const redirectUrl = this.router.url;
      const message = this.translate.instant(`COMMON.PROFILE.UPDATED.DARK_MODE_${ this.isDarkMode.toString().toUpperCase() }`);
      this.store.dispatch(
        new fromActionsUser.UpdateUser({ user, redirectUrl, message })
      );
    }
    return;
  }

  get redirect(): void {
    return this.store.dispatch(
      new fromActionsLogin.Redirect()
    );
  }

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
  }

  onNavigation(elementId: string): void {
    this.router.navigate(['main']).then(() => {
      this.viewportScroller.scrollToAnchor(elementId);
    });
  }

  private resetTheme(theme?: Theme): void {
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
  }
}
