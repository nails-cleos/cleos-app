import { createAction, props } from '@ngrx/store';

enum I18nActionTypes {
  getLanguage = '[Language] Get',
  setLanguage = '[Language] Set'
}

export const getLanguage = createAction(I18nActionTypes.getLanguage);

export const setLanguage = createAction(
  I18nActionTypes.setLanguage,
  props<{ language: string }>(),
);
