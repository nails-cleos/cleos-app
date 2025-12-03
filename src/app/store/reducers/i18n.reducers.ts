import { getLanguage, setLanguage } from '../i18n.actions';
import { createReducer, on } from '@ngrx/store';

export const I18N_FEATURE_KEY = 'i18n';

export interface I18NState {
  language?: string;
}

export const initialState: I18NState = {
  language: undefined,
};

export const i18nReducer = createReducer(
  initialState,
  on(getLanguage, (state) => ({
    ...state,
  })),
  on(setLanguage, (state, { language }) => ({
    ...state,
    language: language,
  })),
);
