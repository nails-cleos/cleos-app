import { Component, OnInit } from '@angular/core';
import { AppState, selectAuthState } from './store/app.states';
import { IUserAll } from './interfaces/user';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { THEME } from './util/theme';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  cssClass: string | undefined;

  constructor(private store: Store<AppState>, private translate: TranslateService,
              private overlayContainer: OverlayContainer, private cookieService: CookieService) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.isAuthenticated) {
        const user: IUserAll = state.user;
        this.translate.use(user.lang || navigator.language);
        if (user.theme) {
          this.onSetTheme(user.theme);
          this.cookieService.set(THEME, user.theme);
        }
      } else {
        this.translate.use(navigator.language);
      }
    });
  }

  ngOnInit(): void {
    const theme = this.cookieService.get(THEME);
    this.onSetTheme(theme ? theme : 'light-theme');
  }

  onSetTheme(theme: string): void {
    if (theme !== this.cssClass) {
      if (theme === 'dark-theme') {
        this.resetTheme(theme);
      } else if (theme === 'light-theme') {
        this.resetTheme(theme);
      } else {
        console.error('Unknown theme: ' + theme);
      }
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
  }
}
