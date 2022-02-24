import { Pagination } from '../../interfaces/pagination';
import { All, CurrencyActionTypes } from '../currency.actions';
import { ICurrency } from '../../interfaces/currency';

export interface State {
  data: ICurrency | Pagination<ICurrency> | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: ICurrency | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case CurrencyActionTypes.getAll: {
      return {
        ...state,
        // @ts-ignore
        data: {content: [{}, {}, {}], totalElements: 3},
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case CurrencyActionTypes.currencyFind: {
      return {
        ...state,
        data: {} as ICurrency,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case CurrencyActionTypes.currencySuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case CurrencyActionTypes.currencySaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case CurrencyActionTypes.currencySelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case CurrencyActionTypes.currencyFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case CurrencyActionTypes.currencyUpdate:
    case CurrencyActionTypes.currencySave:
    case CurrencyActionTypes.currencyDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case CurrencyActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
