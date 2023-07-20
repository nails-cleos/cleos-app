import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

const appAvailableLanguages = ['en', 'es'];
const defaultLanguage = 'en';

export class TranslateLoaderFactory {
  static forModule(module: string): any {
    return class LazyTranslateLoader implements TranslateLoader {
      getTranslation(lang: string): Observable<any> {
        const match = lang?.match(/([-_])/);
        const currentLang = !match ? lang : lang.substring(0, match.index);
        if (!appAvailableLanguages.includes(currentLang)) {
          return from(import(`../../assets/i18n/${ module }/${ defaultLanguage }.json`));
        }
        return from(import(`../../assets/i18n/${ module }/${ currentLang }.json`));
      }
    };
  }
}

export class MissingTranslateHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    return params.key;
  }

  getValue(lang: string, key: string): void {
    from(import(`../../assets/i18n/me/${ lang }.json`)).subscribe(t => {
      const file = JSON.parse(JSON.stringify(t));
      this.byString(file, key);
    });
  }

  byString(o: any, s: string): any {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    const a = s.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
      const k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  }
}
