import { HttpClient } from '@angular/common/http';
import { effect, ElementRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import {
  catchError,
  concatMap,
  defaultIfEmpty,
  distinctUntilChanged,
  filter,
  from,
  map,
  Observable,
  of,
  startWith,
  take,
} from 'rxjs';
import { goTo } from '../util/animation';
import { getLocale } from '../util/helper';
import { EnvService } from '../services/env.service';
import { DEFAULT_LOCALE } from '../util/dates';
import { MainContentService } from '../services/main-content.service';

export interface LegalPageConfig {
  routeSegment: string;
  unavailableHtml: string;
  fileName: string;
}

export abstract class LegalPageBase {
  protected readonly env: EnvService = inject(EnvService);
  protected readonly router: Router = inject(Router);
  protected readonly http: HttpClient = inject(HttpClient);
  protected readonly sanitizer: DomSanitizer = inject(DomSanitizer);
  protected readonly host: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private readonly mainContent = inject(MainContentService);

  readonly url = this.env.appServer;
  readonly title = this.env.title;
  readonly appDomain = this.env.appDomain;

  readonly legalContent = signal<SafeHtml>(this.sanitizer.bypassSecurityTrustHtml(''));

  private readonly language$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    startWith(undefined),
    map(() => this.currentLanguageFromUrl(this.router.url)),
    distinctUntilChanged(),
  );

  private readonly language = toSignal(this.language$, { initialValue: DEFAULT_LOCALE });

  protected constructor(private readonly config: LegalPageConfig) {
    this.mainContent.configure(false, 'open');

    effect((onCleanup) => {
      const lang = this.language();
      const sub = this.loadContent(lang).subscribe((html) => this.legalContent.set(html));
      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
      this.legalContent();
      setTimeout(() => {
        const fragment = this.router.parseUrl(this.router.url).fragment;
        if (fragment) {
          this.scrollToAnchor(fragment);
        }
      });
    });
  }

  protected handleHostClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest('a[href]') as HTMLAnchorElement | null;
    if (!link) {
      return;
    }

    const id = this.anchorIdFromLink(link);
    if (!id) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.router.navigate(['/', this.language(), 'home', this.config.routeSegment], {
      fragment: id,
      replaceUrl: true,
    }).then(() => this.scrollToAnchor(id));
  }

  protected replaceEnvPlaceholders(content: string, language: string): string {
    return content
      .replace(/\{\{TITLE\}\}/g, this.title)
      .replace(/\{\{APP_DOMAIN\}\}/g, this.appDomain)
      .replace(/\{\{APP_URL\}\}/g, this.url)
      .replace(/\{\{LANGUAGE\}\}/g, language);
  }

  private loadContent(lang: string): Observable<SafeHtml> {
    const locale = getLocale(lang).language;
    const languageOnly = locale.split('-')[0];
    const files = Array.from(new Set([
      `assets/legal/${this.config.fileName}.${locale}.html`,
      `assets/legal/${this.config.fileName}.${languageOnly}.html`,
      `assets/legal/${this.config.fileName}.${DEFAULT_LOCALE}.html`,
    ]));

    return from(files).pipe(
      concatMap((file) => this.http.get(file, { responseType: 'text' }).pipe(catchError(() => of(undefined)))),
      filter((html): html is string => typeof html === 'string'),
      take(1),
      map((html) => this.sanitizer.bypassSecurityTrustHtml(this.prepareContent(html, locale))),
      defaultIfEmpty(this.sanitizer.bypassSecurityTrustHtml(this.config.unavailableHtml)),
    );
  }

  private prepareContent(content: string, language: string): string {
    return this.replaceEnvPlaceholders(content, language);
  }

  private anchorIdFromLink(link: HTMLAnchorElement): string | undefined {
    const rawHref = link.getAttribute('href')?.trim();
    if (!rawHref || rawHref.toLowerCase().startsWith('javascript:')) {
      return undefined;
    }

    if (rawHref.startsWith('#')) {
      if (rawHref.length <= 1) {
        return undefined;
      }
      return decodeURIComponent(rawHref.substring(1));
    }

    let parsedHref: URL;
    try {
      parsedHref = new URL(rawHref, window.location.origin);
    } catch {
      return undefined;
    }

    return decodeURIComponent(parsedHref.hash.substring(1));
  }

  private scrollToAnchor(id: string) {
    const anchorId = id.trim();
    if (!anchorId) {
      return;
    }

    const hostElement = this.host.nativeElement;
    const target = hostElement.querySelector<HTMLElement>(`#${id}`);
    if (target) {
      goTo(target);
    }
  }

  private currentLanguageFromUrl(url: string): string {
    const path = this.currentPathFromUrl(url);
    const lang = path.split('/').filter(Boolean)[0];
    return getLocale(lang).language;
  }

  private currentPathFromUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
