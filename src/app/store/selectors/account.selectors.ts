import { ACCOUNT_FEATURE_KEY, AccountState } from '../reducers/account.reducers';
import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IAccountAll, IAccountTransaction, ITransaction } from '../../interfaces/account';
import { IError, IResponseSuccess } from '../../interfaces/common';

const selectAccountState = createFeatureSelector<AccountState>(ACCOUNT_FEATURE_KEY);

const selectAccountData = createSelector(
  selectAccountState,
  (state: AccountState) => state?.data,
);
export const getAccountTransactionPipe = pipe(
  select(selectAccountData),
  filter((val): val is IAccountTransaction => val !== undefined),
);

const selectCurrentAccountId = createSelector(
  selectAccountState,
  (state: AccountState) => state?.currentAccountId,
);
export const getCurrentAccountIdPipe = pipe(
  select(selectCurrentAccountId),
  filter((val): val is string => val !== undefined),
);

const selectCurrentTransactionId = createSelector(
  selectAccountState,
  (state: AccountState) => state?.currentTransactionId,
);
export const getCurrentTransactionIdPipe = pipe(
  select(selectCurrentTransactionId),
  filter((val): val is string => val !== undefined),
);

export const selectCurrentCustomerId = createSelector(
  selectAccountState,
  (state: AccountState) => state?.currentCustomerId,
);
export const getCurrentCustomerIdPipe = pipe(
  select(selectCurrentCustomerId),
  filter((val): val is string => val !== undefined),
);

const selectedAccount = createSelector(
  selectAccountState,
  (state: AccountState) => state?.selected,
);
export const getSelectedAccountPipe = pipe(
  select(selectedAccount),
  filter((val): val is IAccountAll => val !== undefined),
);

const selectedTransaction = createSelector(
  selectAccountState,
  (state: AccountState) => state?.selected,
);
export const getSelectedTransactionPipe = pipe(
  select(selectedTransaction),
  filter((val): val is ITransaction => val !== undefined),
);

const selectSubErrors = createSelector(
  selectAccountState,
  (state: AccountState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectAccountResponse = createSelector(
  selectAccountState,
  (state: AccountState) => state?.response,
);
export const getAccountResponsePipe = pipe(
  select(selectAccountResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectAccountError = createSelector(
  selectAccountState,
  (state: AccountState) => state?.error,
);

export const selectAccountIsLoading = createSelector(
  selectAccountState,
  (state: AccountState) => state?.isLoading,
);
