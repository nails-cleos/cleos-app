import { Component, OnInit } from '@angular/core';
import { AppState, selectAuthState } from './store/app.states';
import { IUserAll } from './interfaces/user';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { resetTheme } from './util/theme';
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
        this.resetTheme(user.theme);
      } else {
        this.translate.use(navigator.language);
      }
    });
  }

  ngOnInit(): void {
    this.resetTheme();
  }

  private resetTheme(theme?: string): void {
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService);
  }
}
