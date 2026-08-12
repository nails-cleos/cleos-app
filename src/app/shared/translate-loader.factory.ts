import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
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

  static forModule = (module: string) => () => new LazyTranslateLoader(module);
}

class LazyTranslateLoader implements TranslateLoader {
  constructor(private readonly module: string) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return TranslateLoaderFactory.loadJson<TranslationObject>(
      this.module,
      lang,
    );
  }
}
