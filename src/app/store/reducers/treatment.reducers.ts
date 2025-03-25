import { Pagination } from '../../interfaces/pagination';
import { All, TreatmentActionTypes } from '../treatment.actions';
import { ITreatmentAll, ITreatmentGroup } from '../../interfaces/treatment';
import { IColorAll } from '../../interfaces/color';

export interface State {
  data: ITreatmentGroup | Pagination<ITreatmentGroup> | null;
  history: ITreatmentAll[] | null;
  colors: IColorAll[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: ITreatmentGroup | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  history: null,
  colors: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case TreatmentActionTypes.getAll: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITreatmentGroup>,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case TreatmentActionTypes.getAllGroup: {
      return {
        ...state,
        data: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case TreatmentActionTypes.getColors: {
      return {
        ...state,
        colors: null,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case TreatmentActionTypes.treatmentFind: {
      return {
        ...state,
        data: {} as ITreatmentGroup,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case TreatmentActionTypes.treatmentSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case TreatmentActionTypes.colorSuccess: {
      return {
        ...state,
        colors: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case TreatmentActionTypes.treatmentSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        errorMessage: null,
        selected: null,
        subErrors: null,
        isLoading: false
      };
    }
    case TreatmentActionTypes.treatmentSelected: {
      return {
        ...state,
        selected: action.payload.treatment,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case TreatmentActionTypes.treatmentFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case TreatmentActionTypes.treatmentUpdate:
    case TreatmentActionTypes.treatmentSave:
    case TreatmentActionTypes.treatmentDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        selected: null,
        isLoading: true
      };
    }
    case TreatmentActionTypes.treatmentHistory: {
      return {
        ...state,
        history: [{} as ITreatmentAll, {} as ITreatmentAll, {} as ITreatmentAll],
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case TreatmentActionTypes.treatmentHistorySuccess: {
      return {
        ...state,
        history: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
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
