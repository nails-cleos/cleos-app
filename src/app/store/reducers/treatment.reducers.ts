import { Pagination } from '../../interfaces/pagination';
import { All, TreatmentActionTypes } from '../treatment.actions';
import { ITreatmentAll, ITreatmentGroup } from '../../interfaces/treatment';
import { IColor } from '../../interfaces/color';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: ITreatmentGroup[] | Pagination<ITreatmentGroup>;
  history?: ITreatmentAll[];
  colors?: IColor[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: ITreatmentGroup;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  history: undefined,
  colors: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case TreatmentActionTypes.getTreatmentsPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITreatmentGroup>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.getAllTreatmentsGroup: {
      return {
        ...state,
        data: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.getAllColors: {
      return {
        ...state,
        colors: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.getTreatmentGroup: {
      return {
        ...state,
        selected: {} as ITreatmentGroup,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.treatmentSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.colorSuccess: {
      return {
        ...state,
        colors: action.colors,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.treatmentSaveSuccess: {
      return {
        ...state,
        response: action,
        errorMessage: undefined,
        selected: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case TreatmentActionTypes.treatmentSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.treatmentFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case TreatmentActionTypes.updateTreatmentGroup:
    case TreatmentActionTypes.createTreatment:
    case TreatmentActionTypes.deleteTreatmentGroup: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        selected: undefined,
        isLoading: true,
      };
    }
    case TreatmentActionTypes.getAllTreatmentsHistory: {
      return {
        ...state,
        history: [{} as ITreatmentAll, {} as ITreatmentAll, {} as ITreatmentAll],
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.treatmentHistorySuccess: {
      return {
        ...state,
        history: action.history,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case TreatmentActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
