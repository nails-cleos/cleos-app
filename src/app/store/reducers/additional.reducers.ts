import { Pagination } from '../../interfaces/pagination';
import { AdditionalActionTypes, All } from '../additional.actions';
import { IAdditional, IAdditionalAll } from '../../interfaces/additional';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<IAdditional> | IAdditionalAll[];
  groups?: ITreatmentGroup[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IAdditional;
  isLoading: boolean;
}

export const initialState: State = {
  response: undefined,
  data: undefined,
  groups: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case AdditionalActionTypes.getAdditionalPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IAdditional>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
      };
    }
    case AdditionalActionTypes.getAdditionalList: {
      return {
        ...state,
        data: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AdditionalActionTypes.getAdditional: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        selected: {} as IAdditional,
      };
    }
    case AdditionalActionTypes.additionalSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AdditionalActionTypes.additionalSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case AdditionalActionTypes.additionalSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AdditionalActionTypes.additionalFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        isLoading: false,
      };
    }
    case AdditionalActionTypes.updateAdditional:
    case AdditionalActionTypes.createAdditional:
    case AdditionalActionTypes.deleteAdditional: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: true,
      };
    }
    case AdditionalActionTypes.getAllTreatmentsGroup: {
      return {
        ...state,
        groups: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AdditionalActionTypes.findGroupsSuccess: {
      return {
        ...state,
        groups: action.groups,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AdditionalActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
