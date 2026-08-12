import {
  effect,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { TranslateLoaderFactory } from './translate-loader.factory';

export const provideFeatureTranslations = (scope: string) =>
  makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const navigationService = inject(NavigationService);
      const translateService = inject(TranslateService);

      effect((onCleanup) => {
        const lang = navigationService.language$();

        if (!lang) {
          return;
        }

        const subscription = TranslateLoaderFactory.loadJson(
          scope,
          lang,
        ).subscribe((translations) => {
          translateService.setTranslation(lang, translations, true);
        });

        onCleanup(() => subscription.unsubscribe());
      });
    }),
  ]);
