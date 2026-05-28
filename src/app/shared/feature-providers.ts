import { DestroyRef, importProvidersFrom, makeEnvironmentProviders, provideEnvironmentInitializer, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, filter } from 'rxjs';
import { getI18NLanguagePipe } from '../store/selectors/i18n.selectors';
import { MissingTranslateHandler, TranslateLoaderFactory } from './translate-loader.factory';

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
    const store = inject(Store);
    const translate = inject(TranslateService);
    const destroyRef = inject(DestroyRef);

    store.pipe(
      getI18NLanguagePipe,
      filter((language): language is string => Boolean(language)),
      distinctUntilChanged(),
      takeUntilDestroyed(destroyRef),
    ).subscribe(language => {
      translate.use(language);
    });
  }),
]);
