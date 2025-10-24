import { getLanguage, setLanguage } from '../i18n.actions';
import { createReducer, on } from '@ngrx/store';

export interface State {
  language?: string;
}

export const initialState: State = {
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
