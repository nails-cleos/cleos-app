import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import {
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import { IMenu, IUserAll } from '../user/user';
import { Params, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthUserService } from '../services/auth-user.service';
import { FirebaseService } from '../services/firebase.service';
import type { Subscription } from 'rxjs';
import { getLocale } from '../util/helper';
import { IResponseSuccess } from '../interfaces/common';
import { Token } from '../interfaces/token';
import { GoogleAuthProvider } from 'firebase/auth';

type AuthStoreState = StoreState & {
  isAuthenticated: boolean;
  redirect: boolean;
  user: IUserAll | undefined;
  menus: IMenu[] | undefined;
  driveToken: string | undefined;
  queryParams: Params | undefined;
  currentCode: string | undefined;
  authReadyTrigger: number;
};

const STORAGE_KEY = 'auth';

const loadFromStorage = (): Partial<AuthStoreState> | undefined => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return undefined;
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
};

const setPersistedSnapshot = (store: any) =>
  queueMicrotask(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: store.isAuthenticated(),
        user: store.user(),
        menus: store.menus(),
        currentCode: store.currentCode(),
        driveToken: store.driveToken(),
        queryParams: store.queryParams(),
      }),
    );
  });

const initialState: AuthStoreState = {
  ...createStoreInitialState(),
  isAuthenticated: false,
  redirect: false,
  user: undefined,
  menus: undefined,
  driveToken: undefined,
  queryParams: undefined,
  currentCode: undefined,
  authReadyTrigger: 0,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      router = inject(Router),
      authService = inject(AuthService),
      authUserService = inject(AuthUserService),
      firebaseService = inject(FirebaseService),
      translateService = inject(TranslateService),
    ) => {
      let loginSubscription: Subscription | undefined;

      const cancelAll = (): void => {
        loginSubscription?.unsubscribe();
      };

      const patchError = (err: HttpErrorResponse): void =>
        patchCrudError(store, err);

      return {
        clean(): void {
          cancelAll();
          patchState(store, initialState);
          localStorage.removeItem(STORAGE_KEY);
        },

        clearResponse(): void {
          patchState(store, { response: undefined });
        },

        clearError(): void {
          patchState(store, { error: undefined, subErrors: undefined });
        },

        hydrate(): void {
          const data = loadFromStorage();
          if (!data) {
            return;
          }

          patchState(store, data);
        },

        signupSuccess(response: IResponseSuccess): void {
          patchState(store, { response });
        },

        setCurrentCode(code: string): void {
          patchState(store, { currentCode: code });
          setPersistedSnapshot(store);
        },

        getDriveToken(): void {
          firebaseService
            .signInWithGoogle('https://www.googleapis.com/auth/drive')
            .then((result) => {
              const credential =
                GoogleAuthProvider.credentialFromResult(result);
              const driveToken = credential?.accessToken;
              if (driveToken) {
                patchState(store, { driveToken });
                setPersistedSnapshot(store);
              }
            });
        },

        login(
          token: string,
          code?: string,
          theme?: string,
          queryParams?: Params,
        ): void {
          loginSubscription?.unsubscribe();
          patchState(store, {
            user: undefined,
            menus: undefined,
            redirect: false,
            isLoading: true,
          });

          loginSubscription = authService.login(token, code, theme).subscribe({
            next: (token) => {
              this.loginSuccess(token, queryParams, true);
            },
            error: patchError,
          });
        },

        loginSuccess(
          token: Token,
          queryParams?: Params,
          redirect = false,
        ): void {
          patchState(store, {
            isAuthenticated: true,
            user: token.user,
            menus: token.menus,
            queryParams: queryParams,
            redirect,
            authReadyTrigger: Date.now(),
            isLoading: false,
          });
          setPersistedSnapshot(store);
        },

        logOut(): void {
          firebaseService
            .signOut()
            .then(() => {
              authUserService.reloadUser();
              localStorage.removeItem('auth');
              window.location.href = `/${getLocale(translateService.getCurrentLang()).language}/home`;
            })
            .catch((error) => {
              console.error('sign out error: ' + error);
            });
          localStorage.removeItem(STORAGE_KEY);
          this.clean();
        },

        reLogin(): void {
          localStorage.removeItem('auth');
          window.location.href = router.url;
        },

        authRedirect(): void {
          const state = { authReadyTrigger: Date.now() };
          patchState(store, state);
        },
      };
    },
  ),
);
