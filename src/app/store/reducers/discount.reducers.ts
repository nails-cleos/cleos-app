import { Pagination } from '../../interfaces/pagination';
import { All, DiscountActionTypes } from '../discount.actions';
import { IDiscount, IReferral, IUserDiscount } from '../../interfaces/discount';

export interface State {
  data: IDiscount | Pagination<IDiscount> | Pagination<IUserDiscount> | null;
  referrals: IReferral | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IDiscount | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  referrals: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case DiscountActionTypes.getMyDiscounts:
    case DiscountActionTypes.getAll: {
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
    case DiscountActionTypes.getReferrals: {
      return {
        ...state,
        referrals: [] as unknown as IReferral,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case DiscountActionTypes.addDiscount: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
        isLoading: true
      };
    }
    case DiscountActionTypes.discountFind: {
      return {
        ...state,
        data: {} as IDiscount,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case DiscountActionTypes.discountSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case DiscountActionTypes.referralSuccess: {
      return {
        ...state,
        referrals: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case DiscountActionTypes.discountSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case DiscountActionTypes.discountSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case DiscountActionTypes.discountFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case DiscountActionTypes.discountUpdate:
    case DiscountActionTypes.discountSave:
    case DiscountActionTypes.discountDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
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
