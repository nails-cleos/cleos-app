import * as auth from './reducers/auth.reducers';
import * as user from './reducers/user.reducers';
import * as product from './reducers/product.reducers';
import { createFeatureSelector } from '@ngrx/store';

export interface AppState {
  authState: auth.State;
  userState: user.State;
  productState: product.State;
}

export const reducers = {
  auth: auth.reducer,
  user: user.reducer,
  product: product.reducer
};

export const selectAuthState = createFeatureSelector<AppState>('auth');
export const selectUserState = createFeatureSelector<AppState>('user');
export const selectProductState = createFeatureSelector<AppState>('product');
