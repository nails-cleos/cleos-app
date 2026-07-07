import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IAccountAll, IAccountTransaction, ITransaction } from '../account/account';
import { PageRequest } from '../interfaces/common';
import { AccountService } from '../services/account.service';
import {
  cleanCrudCreate,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

type AccountStoreState = StoreState<IAccountTransaction, IAccountAll> & {
  selectedTransaction: ITransaction | undefined;
};

const initialState: AccountStoreState = {
  ...createStoreInitialState<IAccountTransaction, IAccountAll>(),
  selectedTransaction: undefined,
};

export const AccountStore = signalStore(
  withState(initialState),
  withMethods((
    store,
    accountService = inject(AccountService),
    translateService = inject(TranslateService),
  ) => {
    let loadAccountSubscription: Subscription | undefined;
    let loadAccountByCustomerIdSubscription: Subscription | undefined;
    let loadTransactionsSubscription: Subscription | undefined;
    let loadTransactionSubscription: Subscription | undefined;
    let createTransactionSubscription: Subscription | undefined;
    let updateAccountSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadAccountSubscription?.unsubscribe();
      loadAccountByCustomerIdSubscription?.unsubscribe();
      loadTransactionsSubscription?.unsubscribe();
      loadTransactionSubscription?.unsubscribe();
      createTransactionSubscription?.unsubscribe();
      updateAccountSubscription?.unsubscribe();
    };

    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadAccount(id: string): void {
        loadAccountSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadAccountSubscription = accountService.getAccount(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      loadAccountByCustomerId(customerId: string): void {
        loadAccountByCustomerIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadAccountByCustomerIdSubscription = accountService.getAccountByCustomerId(customerId).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      loadTransactions(id: string, request: PageRequest): void {
        loadTransactionsSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadTransactionsSubscription =
          accountService.getTransactionsByAccountId(id, request.page, request.sort, request.direction, request.size)
            .subscribe({
              next: (data) => patchState(store, { data, isLoading: false }),
              error: patchError,
            });
      },

      loadTransaction(id: string, transactionId: string): void {
        loadTransactionSubscription?.unsubscribe();
        patchState(store, { selectedTransaction: undefined, isLoading: true });

        loadTransactionSubscription = accountService.getTransaction(id, transactionId).subscribe({
          next: (selectedTransaction) => patchState(store, { selectedTransaction, isLoading: false }),
          error: patchError,
        });
      },

      createTransaction(id: string, transaction: ITransaction): void {
        createTransactionSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createTransactionSubscription = accountService.createTransaction(id, transaction).subscribe({
          next: (response) => {
            if (response.paymentLink) {
              patchState(store, { isLoading: false });
              window.open(response.paymentLink, '_self');
              return;
            }

            patchState(store, {
              response: {
                message: translateService.instant('ACCOUNT.MONEY_ADDED', { id }),
                path: `accounts/${ id }/transactions/${ response.id }`,
              },
              isLoading: false,
            });
          },
          error: patchError,
        });
      },

      updateAccount(id: string, transaction: ITransaction): void {
        updateAccountSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateAccountSubscription = accountService.updateAccount(id, transaction).subscribe({
          next: (response) => patchState(store, {
            response: {
              message: translateService.instant('ACCOUNT.UPDATED', { id: response.id }),
              path: `accounts/customers/${ transaction.customerId }`,
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);
