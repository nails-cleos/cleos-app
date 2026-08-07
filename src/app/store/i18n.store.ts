import { effect, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { createStoreInitialState, StoreState } from './crud-signal-store';
import { DEFAULT_LOCALE } from '../util/dates';

type I18NStoreState = StoreState & {
  language: string;
};

const STORAGE_KEY = 'I18N';

const initialState: I18NStoreState = {
  ...createStoreInitialState(),
  language: '',
};

const loadFromStorage = (): Partial<I18NStoreState> | undefined => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return undefined;
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
};

const persist = (language: string): void => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ language }),
  );
};

export const I18NStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    translateService = inject(TranslateService),
  ) => ({
    hydrate(): void {
      const data = loadFromStorage();

      if (data) {
        patchState(store, data);
      } else {
        patchState(store, { language: translateService.getCurrentLang() || DEFAULT_LOCALE });
      }
    },

    setLanguage(language: string): void {
      patchState(store, { language });
      persist(language);
    },

    clean(): void {
      patchState(store, initialState);
      localStorage.removeItem(STORAGE_KEY);
    },

    clearResponse(): void {
      patchState(store, { response: undefined });
    },

    clearError(): void {
      patchState(store, { error: undefined, subErrors: undefined });
    },
  })),

  withHooks({
    onInit(
      store,
      translateService = inject(TranslateService),
    ) {
      effect(() => {
        const lang = store.language();

        if (!lang || translateService.getCurrentLang() === lang) {
          return;
        }

        translateService.use(lang);
      });
    },
  }),
);
