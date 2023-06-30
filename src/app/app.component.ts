import { Component, Inject, OnInit } from '@angular/core';
import { AppState, selectAuthState } from './store/app.states';
import { IUserAll } from './interfaces/user';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { resetTheme, Theme } from './util/theme';
import { getLocale } from './util/helper';
import { ThemeService } from 'ng2-charts';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { YearMonthDateAdapter } from './util/adapter/year-month-date.adapter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{
    provide: DateAdapter,
    useClass: YearMonthDateAdapter
  }]
})
export class AppComponent implements OnInit {

  private cssClass?: string;

  constructor(private store: Store<AppState>, private translate: TranslateService,
              private overlayContainer: OverlayContainer, private cookieService: CookieService,
              private themeService: ThemeService, private dateAdapter: DateAdapter<Date>,
              @Inject(MAT_DATE_LOCALE) private locale: string) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      if (state.isAuthenticated) {
        const user: IUserAll = state.user;
        this.resetTheme(user.theme);
        this.locale = user.locale || navigator.language;
      } else {
        this.locale = navigator.language;
      }
      const currentLocale = getLocale(this.locale);
      this.dateAdapter.setLocale(currentLocale.language);
      this.translate.use(currentLocale.language);
    });
  }

  ngOnInit(): void {
    this.resetTheme();
  }

  private resetTheme(theme?: Theme): void {
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
  }
}
