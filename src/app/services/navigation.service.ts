import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { currentLanguageFromUrl, getLocale } from '../util/helper';
import { I18NStore } from '../store/i18n.store';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private static readonly HISTORY_STORAGE_KEY = 'cleos-navigation-history';
  private static readonly HISTORY_LIMIT = 40;

  private i18nStore = inject(I18NStore);
  private router: Router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private history: string[] = this.readHistory();
  private isTrackingHistory = false;

  readonly language$ = this.i18nStore.language;

  readonly urlLanguage$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    startWith(undefined),
    map(() => currentLanguageFromUrl(this.router.url)),
    distinctUntilChanged(),
  );

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

  navigate(path?: (string | number | undefined)[], extras?: NavigationExtras) {
    if (path) {
      return this.router.navigate([`/${ this.language$() }/${ path.join('/') }`], extras);
    }
    return this.router.navigate([this.router.url]);
  }

  get language(): string {
    return this.language$();
  }

  private syncCurrentUrl(reloadHistory: boolean = true): void {
    if (reloadHistory) {
      this.history = this.readHistory();
    }

    this.pushHistory(this.router.url);
  }

  private resolveFallbackUrl(currentUrl: string): string {
    const currentLang = getLocale(this.language$()).language;
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

  reload(url: string[] = this.router.url.split('/'), data?: any, queryParams?: any): void {
    this.router.navigate(url.filter(Boolean), { state: data, queryParams });
  }
}
