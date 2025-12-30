import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { USER_FEATURE_KEY, UserState } from '../reducers/user.reducers';
import { IOverview, IUserAll } from '../../interfaces/user';
import { Pagination } from '../../interfaces/pagination';
import { Role } from '../../interfaces/token';

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
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectAllUsers = createSelector(
  selectUserState,
  (state: UserState) => state?.users,
);
export const getAllUsersPipe = pipe(
  select(selectAllUsers),
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectCurrentUserId = createSelector(
  selectUserState,
  (state: UserState) => state?.currentUserId,
);
export const getCurrentUserIdPipe = pipe(
  select(selectCurrentUserId),
  filter((val): val is string => val !== undefined),
);

const selectUserPagination = createSelector(
  selectUserState,
  (state: UserState) => state?.data,
);
export const getUserPaginationPipe = pipe(
  select(selectUserPagination),
  filter((val): val is Pagination<IUserAll> => val !== undefined),
);

const selectOverview = createSelector(
  selectUserState,
  (state: UserState) => state?.data,
);
export const getOverviewPipe = pipe(
  select(selectOverview),
  filter((val): val is IOverview => val !== undefined),
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
  filter((val): val is ResponseSuccess => val !== undefined),
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
