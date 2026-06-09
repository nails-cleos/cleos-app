import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse, PageRequest } from '../interfaces/common';
import { IExpense, IExpenseAll, IExpenseInfo } from '../room/me/expense/expense';
import { Pagination } from '../interfaces/pagination';
import { ExpenseService } from '../services/expense.service';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

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
  withMethods((store, expenseService = inject(ExpenseService), translate = inject(TranslateService)) => {
    const patchError = (err: any): void => {
      const error = mapCrudHttpError(err);
      patchState(store, {
        error,
        subErrors: error.subErrors,
        response: undefined,
        isLoading: false,
      });
    };

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
        patchState(store, {
          data: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IExpenseAll>,
          response: undefined,
          error: undefined,
          subErrors: undefined,
          selected: undefined,
        });

        expenseService.getExpensesPage(roomId, sort, direction, page, size, filter, dateFilter).subscribe({
          next: (data) => patchState(store, {
            data,
            response: undefined,
            error: undefined,
            subErrors: undefined,
          }),
          error: patchError,
        });
      },

      loadInfo(roomId: string): void {
        patchState(store, {
          info: undefined,
          response: undefined,
          error: undefined,
          subErrors: undefined,
          selected: undefined,
        });

        expenseService.getAllExpensesInfo(roomId).subscribe({
          next: (info) => patchState(store, {
            info,
            response: undefined,
            error: undefined,
            subErrors: undefined,
          }),
          error: patchError,
        });
      },

      loadById(roomId: string, id: string): void {
        patchState(store, {
          selected: undefined,
          response: undefined,
          error: undefined,
          subErrors: undefined,
        });

        expenseService.getExpense(roomId, id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      create(roomId: string, expense: IExpense, file: File): void {
        patchState(store, {
          response: undefined,
          error: undefined,
          subErrors: undefined,
          isLoading: true,
          selected: undefined,
        });

        expenseService.createExpense(roomId, expense, file).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('EXPENSE.CREATED', { invoice: response.name }),
              path: `rooms/${ roomId }/expenses/${ response.id }`,
            },
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, roomId: string, expense: IExpense, file?: File): void {
        patchState(store, {
          response: undefined,
          error: undefined,
          subErrors: undefined,
          isLoading: true,
          selected: undefined,
        });

        expenseService.updateExpense(id, roomId, expense, file).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('EXPENSE.UPDATED.MESSAGE', { invoice: response.name }),
              path: `rooms/${ roomId }/expenses/${ response.id }`,
            },
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(roomId: string, id: string, invoice: string): void {
        patchState(store, {
          response: undefined,
          error: undefined,
          subErrors: undefined,
          isLoading: true,
          selected: undefined,
        });

        expenseService.deleteExpense(roomId, id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('EXPENSE.DELETED.MESSAGE', { invoice }),
              reload: true,
              toastType: 'warning',
            },
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
