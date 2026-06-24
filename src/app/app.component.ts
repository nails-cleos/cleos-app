import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CookieService } from 'ngx-cookie-service';
import { ThemeService } from 'ng2-charts';
import { DateAdapter } from '@angular/material/core';

import { resetTheme, Theme } from './util/theme';
import { getLocale } from './util/helper';
import { AuthUserService } from './services/auth-user.service';
import { SeoService } from './services/seo.service';
import { I18NStore } from "./store/i18n.store";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly translate = inject(TranslateService);
  private readonly overlayContainer = inject(OverlayContainer);
  private readonly cookieService = inject(CookieService);
  private readonly themeService = inject(ThemeService);
  private readonly dateAdapter = inject(DateAdapter<Date>);
  private readonly authUserService = inject(AuthUserService);
  private readonly seoService = inject(SeoService);
  private readonly i18nStore = inject(I18NStore);

  private readonly cssClass = signal<string | undefined>(undefined);
  private readonly authUserSignal = this.authUserService.authUser;

  private lastLanguage?: string;

  constructor() {
    effect(() => {
      const user = this.authUserSignal();
      if (!user) {
        return;
      }

      this.resetConfig(user.locale, user.theme);
    });
  }

  private resetConfig = (locale: string, theme?: Theme): void => {
    const currentLocale = getLocale(locale);

    if (this.lastLanguage !== currentLocale.language) {
      this.lastLanguage = currentLocale.language;
      this.i18nStore.setLanguage(currentLocale.language);

      const meta = this.translate.instant('META');

      this.seoService.setMetaDescription(meta.CONTENT);
      this.seoService.setMetaTitle(meta.TITLE);

      this.dateAdapter.setLocale(currentLocale.language);
    }

    this.cssClass.set(resetTheme(
      this.overlayContainer,
      this.cookieService,
      this.themeService,
      theme,
      this.cssClass(),
    ));
  };
}
