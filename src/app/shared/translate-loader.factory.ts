import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

const appAvailableLanguages = ['en', 'es'];
const defaultLanguage = 'en';

export class TranslateLoaderFactory {
  static forModule(module: string): any {
    return class LazyTranslateLoader implements TranslateLoader {
      getTranslation(lang: string): Observable<any> {
        const match = lang.match(/([-_])/);
        const currentLang = !match ? lang : lang.substr(0, match.index);
        if (!appAvailableLanguages.includes(currentLang)) {
          return from(import(`../../assets/i18n/${module}/${defaultLanguage}.json`));
        }
        return from(import(`../../assets/i18n/${module}/${currentLang}.json`));
      }
    };
  }
}
