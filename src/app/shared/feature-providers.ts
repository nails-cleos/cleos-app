import {
  effect,
  importProvidersFrom,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MissingTranslateHandler, TranslateLoaderFactory } from './translate-loader.factory';
import { NavigationService } from '../services/navigation.service';

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
    const navigationService = inject(NavigationService);
    const translateService = inject(TranslateService);

    effect(() => {
      const lang = navigationService.language$();

      if (lang) {
        translateService.use(lang);
      }
    });
  }),
]);
