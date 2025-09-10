import { All, MainActionTypes } from '../main.actions';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  catalogue?: ICatalogue[];
  groups?: ITreatmentGroup[];
  errorMessage?: string;
  error?: IError;
  isLoading: boolean;
}

export const initialState: State = {
  catalogue: undefined,
  groups: undefined,
  errorMessage: undefined,
  error: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case MainActionTypes.getAllCatalogue: {
      return {
        ...state,
        catalogue: [{}, {}, {}],
        errorMessage: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case MainActionTypes.getListTreatmentsGroup: {
      return {
        ...state,
        groups: undefined,
        errorMessage: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case MainActionTypes.updateMyUser:
    case MainActionTypes.sendMessage: {
      return {
        ...state,
        errorMessage: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case MainActionTypes.catalogueSuccess: {
      return {
        ...state,
        catalogue: action.catalogues,
        errorMessage: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case MainActionTypes.treatmentSuccess: {
      return {
        ...state,
        groups: action.groups,
        errorMessage: undefined,
        response: undefined,
        isLoading: false,
      };
    }
    case MainActionTypes.requestSuccess: {
      return {
        ...state,
        response: action,
        errorMessage: undefined,
        isLoading: false,
      };
    }
    case MainActionTypes.requestFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        response: undefined,
        isLoading: false,
      };
    }
    case MainActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
