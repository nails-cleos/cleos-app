import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IAccountAll, IAccountTransaction, ITransaction } from '../interfaces/account';
import { PageRequest } from '../interfaces/common';
import { AccountService } from '../services/account.service';
import { createStoreInitialState, mapCrudHttpError, StoreState } from './crud-signal-store';

type AccountStoreState = StoreState<IAccountTransaction, IAccountAll> & {
  selectedTransaction: ITransaction | undefined;
};

const initialState: AccountStoreState = {
  ...createStoreInitialState<IAccountTransaction, IAccountAll>(),
  selectedTransaction: undefined,
};

export const AccountStore = signalStore(
  withState(initialState),
  withMethods((store, accountService = inject(AccountService), translate = inject(TranslateService)) => {
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

      loadAccount(id: string): void {
        patchState(store, {
          selected: {} as IAccountAll,
          selectedTransaction: undefined,
          response: undefined,
          subErrors: undefined,
          error: undefined,
        });

        accountService.getAccount(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      loadAccountByCustomerId(customerId: string): void {
        patchState(store, {
          selected: {} as IAccountAll,
          selectedTransaction: undefined,
          response: undefined,
          subErrors: undefined,
          error: undefined,
        });

        accountService.getAccountByCustomerId(customerId).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      loadTransactions(id: string, request: PageRequest): void {
        patchState(store, {
          data: {
            account: undefined,
            transactions: { content: [{}, {}, {}], totalElements: 3, totalPages: 1, number: 0 },
          },
          selectedTransaction: undefined,
          response: undefined,
          subErrors: undefined,
          error: undefined,
        });

        accountService.getTransactionsByAccountId(id, request.page, request.sort, request.direction, request.size)
          .subscribe({
            next: (data) => patchState(store, { data, response: undefined, subErrors: undefined, error: undefined }),
            error: patchError,
          });
      },

      loadTransaction(id: string, transactionId: string): void {
        patchState(store, {
          selectedTransaction: undefined,
          response: undefined,
          subErrors: undefined,
          error: undefined,
        });

        accountService.getTransaction(id, transactionId).subscribe({
          next: (selectedTransaction) => patchState(store, { selectedTransaction }),
          error: patchError,
        });
      },

      createTransaction(id: string, transaction: ITransaction): void {
        patchState(store, {
          response: undefined,
          subErrors: undefined,
          error: undefined,
          isLoading: true,
        });

        accountService.createTransaction(id, transaction).subscribe({
          next: (response) => {
            if (response.paymentLink) {
              patchState(store, { isLoading: false });
              window.open(response.paymentLink, '_self');
              return;
            }

            patchState(store, {
              response: {
                message: translate.instant('ACCOUNT.MONEY_ADDED', { id }),
                path: `accounts/${ id }/transactions/${ response.id }`,
              },
              selectedTransaction: undefined,
              subErrors: undefined,
              isLoading: false,
            });
          },
          error: patchError,
        });
      },

      updateAccount(id: string, transaction: ITransaction, customerId: string): void {
        patchState(store, {
          response: undefined,
          subErrors: undefined,
          error: undefined,
          isLoading: true,
        });

        accountService.updateAccount(id, transaction).subscribe({
          next: (response) => patchState(store, {
            response: {
              message: translate.instant('ACCOUNT.UPDATED', { id: response.id }),
              path: `accounts/customers/${ customerId }`,
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
