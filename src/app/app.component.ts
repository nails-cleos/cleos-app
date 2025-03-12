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
import { Observable, Subscription } from 'rxjs';
import { SeoService } from './services/seo.service';
import { Store } from '@ngrx/store';
import { AppState, selectI18nState } from './store/app.states';
import * as fromActionsI18n from './store/i18n.actions';


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

  private getI18nState: Observable<any>;
  private i18nSubscription?: Subscription;

  constructor(private translate: TranslateService, private overlayContainer: OverlayContainer,
              private cookieService: CookieService,
              private themeService: ThemeService, private dateAdapter: DateAdapter<Date>,
              private authUserService: AuthUserService,
              @Inject(MAT_DATE_LOCALE) private locale: string, private seoService: SeoService,
              private readonly store: Store<AppState>) {
    this.authUserServiceSubscription = this.authUserService.authUser
      .subscribe(value => this.resetConfig(value.locale, value.theme));

    this.getI18nState = this.store.select(selectI18nState);
  }

  ngOnInit(): void {
    this.i18nSubscription = this.getI18nState.subscribe(state => this.translate.use(state.data));
  }

  ngOnDestroy(): void {
    this.authUserServiceSubscription.unsubscribe();
    this.i18nSubscription?.unsubscribe();
  }

  private resetConfig = (locale: string, theme?: Theme): void => {
    const meta = this.translate.instant('META');

    this.seoService.setMetaDescription(meta.CONTENT);
    this.seoService.setMetaTitle(meta.TITLE);
    this.cssClass = resetTheme(theme, this.cssClass, this.overlayContainer, this.cookieService, this.themeService);
    this.locale = locale;
    const currentLocale = getLocale(this.locale);
    this.dateAdapter.setLocale(currentLocale.language);
    this.store.dispatch(new fromActionsI18n.SetLanguage(currentLocale.language));
  }
}
