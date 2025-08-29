import { Pagination } from '../../interfaces/pagination';
import { AccountActionTypes, All } from '../account.actions';
import { IAccount, IAccountTransaction, ITransaction } from '../../interfaces/account';
import { IPaymentOption } from '../../interfaces/payment';

export interface State {
  data: IAccount | IAccountTransaction | null;
  paymentOptions: IPaymentOption[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IAccount | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  paymentOptions: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case AccountActionTypes.findTransactionById:
    case AccountActionTypes.findAccountByCustomerId:
    case AccountActionTypes.findAccountById: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case AccountActionTypes.paymentOptions: {
      return {
        ...state,
        paymentOptions: null,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AccountActionTypes.getTransactionsByAccountId: {
      return {
        ...state,
        data: {
          transactions: { content: [{}, {}, {}], totalElements: 3 } as Pagination<ITransaction>,
          account: undefined,
        },
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AccountActionTypes.accountSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AccountActionTypes.paymentOptionsSuccess: {
      return {
        ...state,
        paymentOptions: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AccountActionTypes.accountSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false,
      };
    }
    case AccountActionTypes.accountSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case AccountActionTypes.accountFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false,
      };
    }
    case AccountActionTypes.updateAccountById:
    case AccountActionTypes.addMoney: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true,
      };
    }
    case AccountActionTypes.paymentSend: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
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
