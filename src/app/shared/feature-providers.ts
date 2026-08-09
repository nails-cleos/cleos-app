import {
  effect,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import {
  provideChildTranslateService,
  provideMissingTranslationHandler,
  provideTranslateLoader,
  TranslateService,
} from '@ngx-translate/core';
import {
  MissingTranslateHandler,
  TranslateLoaderFactory,
} from './translate-loader.factory';
import { NavigationService } from '../services/navigation.service';

export const provideFeatureTranslations = (scope: string) =>
  makeEnvironmentProviders([
    provideChildTranslateService({
      loader: provideTranslateLoader(TranslateLoaderFactory.forModule(scope)),
      missingTranslationHandler: provideMissingTranslationHandler(
        MissingTranslateHandler,
      ),
    }),
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
