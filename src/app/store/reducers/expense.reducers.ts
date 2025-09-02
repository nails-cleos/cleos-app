import { Pagination } from '../../interfaces/pagination';
import { All, ExpenseActionTypes } from '../expense.actions';
import { IExpense, IExpenseInfo } from '../../interfaces/expense';

export interface State {
  path: string | null;
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
  path: null,
  data: null,
  info: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case ExpenseActionTypes.getExpensesPage: {
      return {
        ...state,
        data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IExpense>,
        path: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case ExpenseActionTypes.getAllExpensesInfo: {
      return {
        ...state,
        path: null,
        info: null,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null,
      };
    }
    case ExpenseActionTypes.findExpenseById: {
      return {
        ...state,
        selected: {} as IExpense,
        path: null,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case ExpenseActionTypes.expenseSuccess: {
      return {
        ...state,
        data: action.payload,
        path: null,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case ExpenseActionTypes.expenseInfoSuccess: {
      return {
        ...state,
        info: action.payload,
        path: null,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case ExpenseActionTypes.expenseSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        path: action.payload.path,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false,
      };
    }
    case ExpenseActionTypes.expenseSelected: {
      return {
        ...state,
        selected: action.payload.expense,
        path: null,
        errorMessage: null,
        subErrors: null,
        message: null,
      };
    }
    case ExpenseActionTypes.expenseFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        path: null,
        message: null,
        isLoading: false,
      };
    }
    case ExpenseActionTypes.updateExpenseById:
    case ExpenseActionTypes.createExpense:
    case ExpenseActionTypes.deleteExpenseById: {
      return {
        ...state,
        path: null,
        errorMessage: null,
        subErrors: null,
        message: null,
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
