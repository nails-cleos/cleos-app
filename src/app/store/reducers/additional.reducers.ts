import { Pagination } from '../../interfaces/pagination';
import { AdditionalActionTypes, All } from '../additional.actions';
import { IAdditional } from '../../interfaces/additional';
import { ITreatmentGroup } from '../../interfaces/treatment';

export interface State {
  data: IAdditional | Pagination<IAdditional> | null;
  groups: ITreatmentGroup[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IAdditional | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  groups: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case AdditionalActionTypes.getAdditionalPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IAdditional>,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case AdditionalActionTypes.getAdditionalList: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AdditionalActionTypes.findAdditionalById: {
      return {
        ...state,
        data: {} as IAdditional,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case AdditionalActionTypes.additionalSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AdditionalActionTypes.additionalSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false,
      };
    }
    case AdditionalActionTypes.additionalSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AdditionalActionTypes.additionalFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false,
      };
    }
    case AdditionalActionTypes.updateAdditionalById:
    case AdditionalActionTypes.createAdditional:
    case AdditionalActionTypes.deleteAdditionalById: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true,
      };
    }
    case AdditionalActionTypes.getAllTreatmentsGroup: {
      return {
        ...state,
        groups: null,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AdditionalActionTypes.findGroupsSuccess: {
      return {
        ...state,
        groups: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
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
