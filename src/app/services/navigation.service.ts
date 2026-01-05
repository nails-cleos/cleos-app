import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { getLocale } from '../util/helper';
import { IUser, User } from '../interfaces/user';
import { updateMyUser } from '../store/user.actions';
import { Store } from '@ngrx/store';
import { setLanguage } from '../store/i18n.actions';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { I18NState } from '../store/reducers/i18n.reducers';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  private store: Store<I18NState> = inject(Store<I18NState>);
  private router: Router = inject(Router);

  private readonly languageSignal = toSignal(this.store.pipe(getI18NLanguagePipe));

  private history: string[] = [];

  subscribe = (): void => {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!event.urlAfterRedirects.includes('/payment/success?')
          && !event.urlAfterRedirects.includes('/payment/failure?')) {
          this.history.push(event.urlAfterRedirects);
        }
      }
    });
  };

  back = (date?: Date, step: number = 0): void => {
    this.history.pop();
    if (this.history.length > 0) {
      const last = this.history[this.history.length - 1];
      this.router.navigate([last], { state: { date, step } });
    } else {
      this.reloadPage();
    }
  };

  reload = (url: string[], data?: any, queryParams?: any, reloadURL = '/auth/redirect', lang?: string): void => {
    const currentLang = getLocale(this.languageSignal()).language;
    const navigateUrl = `/${lang || currentLang}${reloadURL}`;
    this.router.navigateByUrl(navigateUrl, { skipLocationChange: true }).then(() =>
      this.router.navigate(url.filter(path => path), { state: data, queryParams }));
  };

  reloadPage = (url?: string): void => {
    const currentLang = getLocale(this.languageSignal()).language;
    const currentUrl = url ?? `/${currentLang}`;
    this.router.navigateByUrl(currentUrl).then(() => window.location.reload());
  };

  attachLang = (lang?: string, currentUser?: IUser): string => {
    const language = getLocale(lang).language;
    const currentLang = this.languageSignal();

    if (language === currentLang) {
      return language;
    }

    this.store.dispatch(setLanguage({ language }));

    const userLanguage = getLocale(currentUser?.locale).language;

    if (userLanguage !== language) {
      const user: IUser = new User();
      user.lang = language;

      this.store.dispatch(updateMyUser({ user, redirectUrl: this.router.url }));
    }

    return language;
  };
}
