import { importProvidersFrom, inject, makeEnvironmentProviders, provideEnvironmentInitializer, } from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService, } from '@ngx-translate/core';

import { I18NStore } from '../store/i18n.store';
import { MissingTranslateHandler, TranslateLoaderFactory, } from './translate-loader.factory';

export const provideFeatureTranslations = (scope: string) => makeEnvironmentProviders([
  importProvidersFrom(
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactory.forModule(scope),
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslateHandler,
      },
      isolate: false,
      extend: true,
    }),
  ),
  provideEnvironmentInitializer(() => {
    const i18nStore = inject(I18NStore);
    const translate = inject(TranslateService);

    const language = i18nStore.language();

    if (language) {
      translate.use(language);
    }
  }),
]);
