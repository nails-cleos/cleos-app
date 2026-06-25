import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, PageRequest } from '../interfaces/common';
import { IExpense, IExpenseAll, IExpenseInfo } from '../room/me/expense/expense';
import { Pagination } from '../interfaces/pagination';
import { ExpenseService } from '../services/expense.service';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';

type ExpenseStoreState = StoreState<Pagination<IExpenseAll>, IExpenseAll> & {
  info: IExpenseInfo | undefined;
};

export type ExpensePageRequest = PageRequest & {
  roomId: string;
  filter?: string;
  dateFilter?: string;
};

const initialState: ExpenseStoreState = {
  ...createStoreInitialState<Pagination<IExpenseAll>, IExpenseAll>(),
  info: undefined,
};

export const ExpenseStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    expenseService = inject(ExpenseService),
    translateService = inject(TranslateService),
  ) => {
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadPage({ roomId, sort, direction, page, size, filter, dateFilter }: ExpensePageRequest): void {
        patchState(store, { data: undefined, isLoading: true });

        expenseService.getExpensesPage(roomId, sort, direction, page, size, filter, dateFilter).subscribe({
          next: (data) => patchState(store, { data, isLoading: false }),
          error: patchError,
        });
      },

      loadInfo(roomId: string): void {
        patchState(store, { info: undefined, isLoading: true });

        expenseService.getAllExpensesInfo(roomId).subscribe({
          next: (info) => patchState(store, { info, isLoading: false }),
          error: patchError,
        });
      },

      loadById(roomId: string, id: string): void {
        patchState(store, { selected: undefined, isLoading: false });

        expenseService.getExpense(roomId, id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      create(roomId: string, expense: IExpense, file: File): void {
        cleanCrudCreate(store);

        expenseService.createExpense(roomId, expense, file).subscribe({
          next: (response: IApiResponse) => {
            patchState(store, {
              response: {
                message: translateService.instant('EXPENSE.CREATED', { invoice: response.name }),
                path: `rooms/${ roomId }/expenses/${ response.id }`,
              },
              isLoading: false,
            });
          },
          error: patchError,
        });
      },

      update(id: string, roomId: string, expense: IExpense, file?: File): void {
        cleanCrudUpdate(store);

        expenseService.updateExpense(id, roomId, expense, file).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('EXPENSE.UPDATED.MESSAGE', { invoice: response.name }),
              path: `rooms/${ roomId }/expenses/${ response.id }`,
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(roomId: string, id: string, invoice: string): void {
        cleanCrudDelete(store);

        expenseService.deleteExpense(roomId, id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translateService.instant('EXPENSE.DELETED.MESSAGE', { invoice }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
