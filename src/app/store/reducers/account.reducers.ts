import { Pagination } from '../../interfaces/pagination';
import { AccountActionTypes, All } from '../account.actions';
import { IAccount, IAccountTransaction, ITransaction } from '../../interfaces/account';
import { IPaymentOption } from '../../interfaces/payment';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: IAccount | IAccountTransaction | ITransaction[];
  paymentOptions?: IPaymentOption[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IAccount;
  isLoading: boolean;
}

export const initialState: State = {
  response: undefined,
  data: undefined,
  paymentOptions: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case AccountActionTypes.getTransaction:
    case AccountActionTypes.getAccountByCustomerId:
    case AccountActionTypes.getAccount: {
      return {
        ...state,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        selected: {} as IAccount,
      };
    }
    case AccountActionTypes.paymentOptions: {
      return {
        ...state,
        response: undefined,
        paymentOptions: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AccountActionTypes.getTransactionsByAccountId: {
      return {
        ...state,
        data: {
          transactions: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITransaction>,
          account: undefined,
        },
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AccountActionTypes.accountSuccess: {
      return {
        ...state,
        data: action.data,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AccountActionTypes.paymentOptionsSuccess: {
      return {
        ...state,
        paymentOptions: action.paymentOptions,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AccountActionTypes.accountSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case AccountActionTypes.accountSelected: {
      return {
        ...state,
        selected: action.selected,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case AccountActionTypes.accountFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case AccountActionTypes.paymentSend:
    case AccountActionTypes.updateAccount:
    case AccountActionTypes.createTransaction: {
      return {
        ...state,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: true,
      };
    }
    case AccountActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
