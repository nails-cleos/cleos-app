import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { resetTheme, Theme } from './util/theme';
import { getLocale } from './util/helper';
import { ThemeService } from 'ng2-charts';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { YearMonthDateAdapter } from './util/adapter/year-month-date.adapter';
import { AuthUserService } from './services/auth-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{
    provide: DateAdapter,
    useClass: YearMonthDateAdapter
  }]
})
export class AppComponent implements OnInit, OnDestroy {

  private cssClass?: string;
  private authUserServiceSubscription: Subscription;

  constructor(private translate: TranslateService, private overlayContainer: OverlayContainer, private cookieService: CookieService,
              private themeService: ThemeService, private dateAdapter: DateAdapter<Date>,
              @Inject(MAT_DATE_LOCALE) private locale: string, private authUserService: AuthUserService) {
    this.authUserServiceSubscription = this.authUserService.authUser.subscribe(value => {
      this.resetTheme(value.theme);
      this.locale = value.locale;
      const currentLocale = getLocale(this.locale);
      this.dateAdapter.setLocale(currentLocale.language);
      this.translate.use(currentLocale.language);
    });
  }

  ngOnInit(): void {
    this.resetTheme();
  }

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
  }

  private resetTheme(theme?: Theme): void {
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
  }
}
