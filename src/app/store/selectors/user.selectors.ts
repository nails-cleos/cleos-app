import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { USER_FEATURE_KEY, UserState } from '../reducers/user.reducers';
import { IUserAll } from '../../user/user';
import { Role } from '../../interfaces/token';
import { map } from 'rxjs/operators';

const selectUserState = createFeatureSelector<UserState>(USER_FEATURE_KEY);

const selectedUser = createSelector(
  selectUserState,
  (state: UserState) => state?.selected,
);
export const getSelectedUserPipe = pipe(
  select(selectedUser),
  filter((val): val is IUserAll => val !== undefined),
);
const selectAllCustomers = createSelector(
  selectUserState,
  (state: UserState) => state?.data,
);
export const getAllCustomersPipe = pipe(
  select(selectAllCustomers),
  filter((val) => val?.kind === 'list'),
  map((val) => val.value),
);

const selectAllUsers = createSelector(
  selectUserState,
  (state: UserState) => state?.users,
);
export const getAllUsersPipe = pipe(
  select(selectAllUsers),
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectUserPaginationData = createSelector(
  selectUserState,
  (state: UserState) => state?.data,
);
export const getUserPaginationPipe = pipe(
  select(selectUserPaginationData),
  filter((val) => val?.kind === 'pagination'),
  map((val) => val.value),
);

const selectOverview = createSelector(
  selectUserState,
  (state: UserState) => state?.data,
);
export const getOverviewPipe = pipe(
  select(selectOverview),
  filter((val) => val?.kind === 'overview'),
  map((val) => val.value),
);

const selectNavigationParams = createSelector(
  selectUserState,
  (state: UserState) => state?.userNavigationParams,
);
export const getNavigationParamsPipe = pipe(
  select(selectNavigationParams),
  filter((val): val is { role?: Role } => val !== undefined),
);

const selectSubErrors = createSelector(
  selectUserState,
  (state: UserState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectUserResponse = createSelector(
  selectUserState,
  (state: UserState) => state?.response,
);
export const getUserResponsePipe = pipe(
  select(selectUserResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state?.error,
);
export const getUserErrorPipe = pipe(
  select(selectUserError),
  filter((val): val is IError => val !== undefined),
);

export const selectUserIsLoading = createSelector(
  selectUserState,
  (state: UserState) => state?.isLoading,
);
