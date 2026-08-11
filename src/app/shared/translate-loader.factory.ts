import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateLoader,
  TranslationObject,
} from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getLocale } from '../util/helper';

const appAvailableLanguages = ['en', 'es', 'nl'];
const defaultLanguage = 'en';

export class TranslateLoaderFactory {
  static loadJson<T = TranslationObject>(
    module: string,
    lang: string,
  ): Observable<T> {
    const currentLang = getLocale(lang).i18n;

    const fileLang = appAvailableLanguages.includes(currentLang)
      ? currentLang
      : defaultLanguage;

    return from(import(`../../assets/i18n/${module}/${fileLang}.json`)).pipe(
      map((translations) => translations.default as T),
    );
  }

  static forModule = (module: string): any =>
    class LazyTranslateLoader implements TranslateLoader {
      getTranslation(lang: string): Observable<TranslationObject> {
        return TranslateLoaderFactory.loadJson<TranslationObject>(module, lang);
      }
    };
}

export class MissingTranslateHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    return params.key;
  }

  getValue = (lang: string, key: string): void => {
    from(import(`../../assets/i18n/me/${lang}.json`)).subscribe((t) => {
      const file = JSON.parse(JSON.stringify(t));
      this.byString(file, key);
    });
  };

  byString = (o: any, s: string): any => {
    s = s.replace(/[(\w+)]/g, '.$1');
    s = s.replace(/^./, '');

    const a = s.split('.');

    for (let i = 0, n = a.length; i < n; ++i) {
      const k = a[i];

      if (k in o) {
        o = o[k];
      } else {
        return undefined;
      }
    }

    return o;
  };
}
