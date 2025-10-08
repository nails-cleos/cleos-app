import { All, I18nActionTypes } from '../i18n.actions';

export interface State {
  language?: string;
}

export const initialState: State = {
  language: undefined,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case I18nActionTypes.getLanguage: {
      return {
        ...state,
      };
    }
    case I18nActionTypes.setLanguage: {
      return {
        ...state,
        language: action.language,
      };
    }
    default: {
      return state;
    }
  }
};
