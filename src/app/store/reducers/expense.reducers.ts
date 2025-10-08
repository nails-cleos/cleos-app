import { Pagination } from '../../interfaces/pagination';
import { All, ExpenseActionTypes } from '../expense.actions';
import { IExpense, IExpenseInfo } from '../../interfaces/expense';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: Pagination<IExpense> | IExpense[];
  info?: IExpenseInfo;
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: IExpense;
  isLoading: boolean;
}

export const initialState: State = {
  response: undefined,
  data: undefined,
  info: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case ExpenseActionTypes.getExpensesPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IExpense>,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
      };
    }
    case ExpenseActionTypes.getAllExpensesInfo: {
      return {
        ...state,
        response: undefined,
        info: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
      };
    }
    case ExpenseActionTypes.getExpense: {
      return {
        ...state,
        selected: {} as IExpense,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case ExpenseActionTypes.expenseSuccess: {
      return {
        ...state,
        data: action.data,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case ExpenseActionTypes.expenseInfoSuccess: {
      return {
        ...state,
        info: action.info,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case ExpenseActionTypes.expenseSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case ExpenseActionTypes.expenseSelected: {
      return {
        ...state,
        selected: action.selected,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
      };
    }
    case ExpenseActionTypes.expenseFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case ExpenseActionTypes.updateExpense:
    case ExpenseActionTypes.createExpense:
    case ExpenseActionTypes.deleteExpense: {
      return {
        ...state,
        response: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: true,
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
