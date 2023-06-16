import { Pagination } from '../../interfaces/pagination';
import { All, ExpenseActionTypes } from '../expense.actions';
import { IExpense, IExpenseInfo } from '../../interfaces/expense';

export interface State {
  data: IExpense | Pagination<IExpense> | null;
  info: IExpenseInfo | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: IExpense | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  info: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case ExpenseActionTypes.getAll: {
      return {
        ...state,
        // @ts-ignore
        data: { content: [{}, {}, {}], totalElements: 3 },
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ExpenseActionTypes.getExpenseInfo: {
      return {
        ...state,
        info: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case ExpenseActionTypes.expenseFind: {
      return {
        ...state,
        selected: {} as IExpense,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ExpenseActionTypes.expenseSuccess: {
      return {
        ...state,
        data: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ExpenseActionTypes.expenseInfoSuccess: {
      return {
        ...state,
        info: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ExpenseActionTypes.expenseSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case ExpenseActionTypes.expenseSelected: {
      return {
        ...state,
        selected: action.payload.expense,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case ExpenseActionTypes.expenseFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case ExpenseActionTypes.expenseUpdate:
    case ExpenseActionTypes.expenseSave:
    case ExpenseActionTypes.expenseDelete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
      };
    }
    case ExpenseActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};
