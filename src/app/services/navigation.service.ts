import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { getLocale } from '../util/helper';
import { IUser, User } from '../interfaces/user';
import { updateMyUser } from '../store/actions/user.actions';
import { Store } from '@ngrx/store';
import { setLanguage } from '../store/actions/i18n.actions';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { I18NState } from '../store/reducers/i18n.reducers';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private static readonly HISTORY_STORAGE_KEY = 'cleos-navigation-history';
  private static readonly HISTORY_LIMIT = 40;

  private store: Store<I18NState> = inject(Store<I18NState>);
  private router: Router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly languageSignal = toSignal(this.store.pipe(getI18NLanguagePipe));

  private history: string[] = this.readHistory();
  private isTrackingHistory = false;

  constructor() {
    this.subscribe();
  }

  subscribe(): void {
    if (this.isTrackingHistory) {
      return;
    }

    this.isTrackingHistory = true;
    this.syncCurrentUrl();
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.pushHistory(event.urlAfterRedirects);
        }
      });
  }

  back(date?: Date, step: number = 0): void {
    this.history = this.readHistory();
    this.syncCurrentUrl(false);
    const current = this.normalizeUrl(this.router.url);

    while (this.history.length && this.history[this.history.length - 1] === current) {
      this.history.pop();
    }

    this.writeHistory();

    const previous = this.history[this.history.length - 1];
    const target = previous || this.resolveFallbackUrl(current);
    this.router.navigateByUrl(target, { state: { date, step } });
  }

  private syncCurrentUrl(reloadHistory: boolean = true): void {
    if (reloadHistory) {
      this.history = this.readHistory();
    }

    this.pushHistory(this.router.url);
  }

  private resolveFallbackUrl(currentUrl: string): string {
    const currentLang = getLocale(this.languageSignal()).language;
    const segments = currentUrl.split('/').filter(Boolean);

    if (segments.length <= 1) {
      return `/${ currentLang }`;
    }

    const parentSegments = segments.slice(0, -1);
    return parentSegments.length ? `/${ parentSegments.join('/') }` : `/${ currentLang }`;
  }

  private pushHistory(url: string): void {
    const normalized = this.normalizeUrl(url);

    if (!this.shouldTrackUrl(normalized)) {
      return;
    }

    const last = this.history[this.history.length - 1];
    if (last === normalized) {
      return;
    }

    this.history = [...this.history, normalized].slice(-NavigationService.HISTORY_LIMIT);
    this.writeHistory();
  }

  private shouldTrackUrl(url: string): boolean {
    return !url.includes('/payment/success?')
      && !url.includes('/payment/failure?')
      && !/\/payment\/(approved|pending|cancelled|failure|success|status)(\?|$)/.test(url)
      && !url.includes('/auth/redirect');
  }

  private normalizeUrl(url: string): string {
    return url.split('#')[0];
  }

  private readHistory(): string[] {
    try {
      const raw = sessionStorage.getItem(NavigationService.HISTORY_STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((it): it is string => typeof it === 'string') : [];
    } catch {
      return [];
    }
  }

  private writeHistory(): void {
    try {
      sessionStorage.setItem(NavigationService.HISTORY_STORAGE_KEY, JSON.stringify(this.history));
    } catch {
      // Ignore storage failures and keep in-memory behavior.
    }
  }

  reload(url: string[], data?: any, queryParams?: any, reloadURL = '/auth/redirect', lang?: string): void {
    const currentLang = getLocale(this.languageSignal()).language;
    const navigateUrl = `/${ lang || currentLang }${ reloadURL }`;
    this.router.navigateByUrl(navigateUrl, { skipLocationChange: true }).then(() =>
      this.router.navigate(url.filter(path => path), { state: data, queryParams }));
  }

  reloadPage(url?: string): void {
    const currentLang = getLocale(this.languageSignal()).language;
    const currentUrl = url ?? `/${ currentLang }`;
    this.router.navigateByUrl(currentUrl).then(() => window.location.reload());
  }

  attachLang(lang?: string, currentUser?: IUser): string {
    const language = getLocale(lang).language;
    const currentLang = this.languageSignal();

    if (language === currentLang) {
      return language;
    }

    this.store.dispatch(setLanguage({ language }));

    if (!currentUser) {
      return language;
    }

    const userLanguage = getLocale(currentUser?.locale).language;

    if (userLanguage !== language) {
      const user: IUser = new User();
      user.locale = language;

      this.store.dispatch(updateMyUser({ user, redirectUrl: this.router.url }));
    }

    return language;
  }
}
