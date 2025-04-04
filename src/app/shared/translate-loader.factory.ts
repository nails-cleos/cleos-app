import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { getLocale } from '../util/helper';

const appAvailableLanguages = ['en', 'es'];
const defaultLanguage = 'en';

export class TranslateLoaderFactory {
  static forModule = (module: string): any =>
    class LazyTranslateLoader implements TranslateLoader {
      getTranslation(lang: string): Observable<any> {
        const currentLang = getLocale(lang).i18n;
        const fileLang = appAvailableLanguages.includes(currentLang) ? currentLang : defaultLanguage;

        return from(import(`../../assets/i18n/${ module }/${ fileLang }.json`));
      }
    };
}

export class MissingTranslateHandler implements MissingTranslationHandler {
  handle = (params: MissingTranslationHandlerParams): string => params.key;

  getValue = (lang: string, key: string): void => {
    from(import(`../../assets/i18n/me/${ lang }.json`)).subscribe(t => {
      const file = JSON.parse(JSON.stringify(t));
      this.byString(file, key);
    });
  };

  byString = (o: any, s: string): any => {
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
  };
}
