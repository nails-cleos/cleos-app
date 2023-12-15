import { Component, Inject, OnDestroy } from '@angular/core';
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
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{
    provide: DateAdapter,
    useClass: YearMonthDateAdapter
  }]
})
export class AppComponent implements OnDestroy {

  private cssClass?: string;
  private authUserServiceSubscription: Subscription;

  constructor(private translate: TranslateService, private overlayContainer: OverlayContainer, private cookieService: CookieService,
              private themeService: ThemeService, private dateAdapter: DateAdapter<Date>, private authUserService: AuthUserService,
              @Inject(MAT_DATE_LOCALE) private locale: string, private seoService: SeoService) {
    this.authUserServiceSubscription = this.authUserService.authUser
      .subscribe(value => this.resetConfig(value.locale, value.theme));
  }

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
  }

  private resetConfig(locale: string, theme?: Theme): void {
    const meta = this.translate.instant('META');

    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
    this.locale = locale;
    const currentLocale = getLocale(this.locale);
    this.dateAdapter.setLocale(currentLocale.language);
    if (currentLocale.i18n !== getLocale(this.translate.currentLang).i18n) {
      this.translate.use(currentLocale.language);
    }
  }
}
