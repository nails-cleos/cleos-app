import { Pagination } from '../../interfaces/pagination';
import { All, DiscountActionTypes } from '../discount.actions';
import { IDiscount, IReferral, IUserDiscount } from '../../interfaces/discount';
import { ICurrency } from '../../interfaces/currency';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data: IDiscount | Pagination<IDiscount> | Pagination<IUserDiscount> | IUserDiscount[] | undefined;
  referrals?: IReferral[];
  currencies?: ICurrency[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IDiscount;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  referrals: undefined,
  currencies: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case DiscountActionTypes.getMyDiscountsPage:
    case DiscountActionTypes.getDiscountsPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IDiscount>,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.getMyReferrals: {
      return {
        ...state,
        referrals: [],
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.getAllCurrency: {
      return {
        ...state,
        currencies: [],
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.sendDiscountToCustomers: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case DiscountActionTypes.getDiscount: {
      return {
        ...state,
        data: {} as IDiscount,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.getUserDiscountByCustomerId: {
      return {
        ...state,
        data: [],
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.discountSuccess: {
      return {
        ...state,
        data: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.referralSuccess: {
      return {
        ...state,
        referrals: action.referrals,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.currencySuccess: {
      return {
        ...state,
        currencies: action.currencies,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.discountSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case DiscountActionTypes.discountSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case DiscountActionTypes.discountFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case DiscountActionTypes.updateDiscount:
    case DiscountActionTypes.createDiscount:
    case DiscountActionTypes.deleteDiscount: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case DiscountActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
