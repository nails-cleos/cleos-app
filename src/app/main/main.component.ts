import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AppState, selectAuthState } from '../store/app.states';
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
import { getThemeName, isDarkMode, THEME } from '../util/theme';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  title = environment.title;
  isAuthenticated = false;

  cssClass: string | undefined;
  checked = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches), shareReplay());

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private viewportScroller: ViewportScroller, private router: Router, private translate: TranslateService,
              private overlayContainer: OverlayContainer, private cookieService: CookieService) {
    this.checked = cookieService.get(THEME) === 'dark-theme';
    this.store.select(selectAuthState).subscribe((state: any) => {
      this.isAuthenticated = state.isAuthenticated;
      if (this.isAuthenticated && state.user.theme) {
        this.resetTheme(state.user.theme);
      }
    });
  }

  onNavigation(elementId: string): void {
    this.router.navigate(['main']).then(() => {
      this.viewportScroller.scrollToAnchor(elementId);
    });
  }

  redirect(): void {
    this.store.dispatch(
      new fromActionsLogin.Redirect()
    );
  }

  setTheme(checked: boolean): void {
    const theme: string = getThemeName(checked);
    this.resetTheme(theme);
    this.cookieService.set(THEME, theme);
    if (this.isAuthenticated) {
      const user: IUser = new User();
      user.theme = theme;
      const redirectUrl = this.router.url;
      const message = this.translate.instant(`PROFILE.UPDATED.DARK_MODE_${checked.toString().toUpperCase()}`);
      this.store.dispatch(
        new fromActionsUser.UpdateUser({user, redirectUrl, message})
      );
    }
  }

  private resetTheme(theme: string): void {
    const body = document.getElementsByTagName('body')[0];

    if (this.cssClass) {
      body.classList.remove(this.cssClass);
      this.overlayContainer.getContainerElement().classList.remove(this.cssClass);
    }

    this.cssClass = theme;
    body.classList.add(this.cssClass);
    this.overlayContainer.getContainerElement().classList.add(this.cssClass);
    this.checked = isDarkMode(theme);
  }
}
