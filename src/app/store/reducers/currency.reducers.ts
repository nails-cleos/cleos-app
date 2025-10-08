import { Pagination } from '../../interfaces/pagination';
import { All, CurrencyActionTypes } from '../currency.actions';
import { ICurrency } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<ICurrency>;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: ICurrency;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case CurrencyActionTypes.getCurrenciesPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ICurrency>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case CurrencyActionTypes.getCurrency: {
      return {
        ...state,
        selected: {} as ICurrency,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case CurrencyActionTypes.currencySuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case CurrencyActionTypes.currencySaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case CurrencyActionTypes.currencySelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case CurrencyActionTypes.currencyFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case CurrencyActionTypes.updateCurrency:
    case CurrencyActionTypes.createCurrency:
    case CurrencyActionTypes.deleteCurrency: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
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
