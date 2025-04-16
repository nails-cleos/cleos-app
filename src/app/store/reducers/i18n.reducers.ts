import { All, I18nActionTypes } from '../i18n.actions';

export interface State {
  data: string | null;
}

export const initialState: State = {
  data: null,
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
        data: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};
