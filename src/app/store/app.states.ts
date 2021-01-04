import * as auth from './reducers/auth.reducers';
import * as user from './reducers/user.reducers';
import { createFeatureSelector } from '@ngrx/store';

export interface AppState {
  authState: auth.State;
  userState: user.State;
}

export const reducers = {
  auth: auth.reducer,
  user: user.reducer
};

export const selectAuthState = createFeatureSelector<AppState>('auth');
export const selectUserState = createFeatureSelector<AppState>('user');
