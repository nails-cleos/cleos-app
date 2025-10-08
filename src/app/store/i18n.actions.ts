import { Action } from '@ngrx/store';

export enum I18nActionTypes {
  getLanguage = '[Language] Get',
  setLanguage = '[Language] Set'
}

export class GetLanguage implements Action {
  readonly type = I18nActionTypes.getLanguage;
}

export class SetLanguage implements Action {
  readonly type = I18nActionTypes.setLanguage;

  constructor(public language: string) {
  }
}

export type All =
  | GetLanguage
  | SetLanguage;
