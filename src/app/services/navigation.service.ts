import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { getLocale } from '../util/helper';
import { TranslateService } from '@ngx-translate/core';
import { IUser, User } from '../interfaces/user';
import * as fromActionsUser from '../store/user.actions';
import { AppState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsI18n from '../store/i18n.actions';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private history: string[] = [];

  constructor(private store: Store<AppState>, private router: Router, private translate: TranslateService) {
  }

  subscribe = (): void => {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!event.urlAfterRedirects.includes('/payment/success?')
          && !event.urlAfterRedirects.includes('/payment/failure?')) {
          this.history.push(event.urlAfterRedirects);
        }
      }
    });
  }

  back = (date?: Date, step: number = 0): void => {
    this.history.pop();
    if (this.history.length > 0) {
      const last = this.history[this.history.length - 1];
      this.router.navigate([last], { state: { date, step } });
    } else {
      this.reloadPage();
    }
  }

  reload = (url: string[], data?: any, queryParams?: any, reloadURL = '/auth/redirect', lang?: string): void => {
    const navigateUrl = `/${ lang || getLocale(this.translate.currentLang).language }${ reloadURL }`;
    this.router.navigateByUrl(navigateUrl, { skipLocationChange: true }).then(() =>
      this.router.navigate(url.filter(path => path), { state: data, queryParams }));
  }

  reloadPage = (url: string = `/${ getLocale(this.translate.currentLang).language }`): void => {
    this.router.navigateByUrl(url).then(() => window.location.reload());
  }

  attachLang = (lang: string | null, currentUser?: IUser): string => {
    const language = getLocale(lang).language;
    if (language !== getLocale(this.translate.currentLang).language) {
      const user: IUser = new User();
      user.lang = language;
      const redirectUrl = this.router.url;
      let userLanguage;
      if (currentUser?.locale) {
        userLanguage = getLocale(currentUser.locale);
      }
      this.store.dispatch(new fromActionsI18n.SetLanguage(language));
      if (userLanguage?.language !== language) {
        this.store.dispatch(
          new fromActionsUser.UpdateUser({ user, redirectUrl })
        );
      }
    }
    return language;
  }
}
