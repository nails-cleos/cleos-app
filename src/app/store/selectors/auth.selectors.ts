import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IError, ResponseSuccess } from '../../interfaces/common';
import { AUTH_FEATURE_KEY, AuthState } from '../reducers/auth.reducers';
import { IMenu, IUserAll } from '../../interfaces/user';
import { Params } from '@angular/router';

const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

const selectRedirect = createSelector(
  selectAuthState,
  (state: AuthState) => state?.redirect,
);
export const getRedirectPipe = pipe(
  select(selectRedirect),
  filter((val): val is boolean => val !== undefined),
);

const selectIsLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state?.isLoading,
);
export const getIsLoadingPipe = pipe(
  select(selectIsLoading),
  filter((val): val is boolean => val !== undefined),
);

const selectQueryParams = createSelector(
  selectAuthState,
  (state: AuthState) => state?.queryParams,
);
export const getQueryParamsPipe = pipe(
  select(selectQueryParams),
  filter((val): val is Params => val !== undefined),
);

const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state?.isAuthenticated,
);
export const getIsAuthenticatedPipe = pipe(
  select(selectIsAuthenticated),
  filter((val): val is boolean => val !== undefined),
);

const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state?.user,
);
export const getUserPipe = pipe(
  select(selectUser),
  filter((val): val is IUserAll => val !== undefined),
);

const selectToken = createSelector(
  selectAuthState,
  (state: AuthState) => state?.token,
);
export const getTokenPipe = pipe(
  select(selectToken),
  filter((val): val is string => val !== undefined),
);

const selectMenus = createSelector(
  selectAuthState,
  (state: AuthState) => state?.menus,
);
export const getMenusPipe = pipe(
  select(selectMenus),
  filter((val): val is IMenu[] => val !== undefined),
);

const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state?.error,
);
export const getAuthErrorPipe = pipe(
  select(selectAuthError),
  filter((val): val is IError => val !== undefined),
);

const selectSubErrors = createSelector(
  selectAuthState,
  (state: AuthState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

const selectResponse = createSelector(
  selectAuthState,
  (state: AuthState) => state?.response,
);
export const getResponsePipe = pipe(
  select(selectResponse),
  filter((val): val is ResponseSuccess => val !== undefined),
);

const selectCurrentCode = createSelector(
  selectAuthState,
  (state: AuthState) => state?.currentCode,
);
export const getCurrentCodePipe = pipe(
  select(selectCurrentCode),
  filter((val): val is string => val !== undefined),
);
