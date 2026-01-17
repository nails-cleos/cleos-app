import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { User } from '@firebase/auth';
import { Subscription, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';

import { IUserAll } from '../interfaces/user';
import { getNowTimeZone, newDate, plusMinutes } from '../util/dates';
import { getDriveTokenPipe, getTokenPipe, getUserPipe } from '../store/selectors/auth.selectors';
import { AuthState } from '../store/reducers/auth.reducers';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly store = inject(Store<AuthState>);
  private readonly auth = inject(Auth);

  private readonly storeToken = toSignal(this.store.pipe(getTokenPipe), { initialValue: null });
  private readonly tokenSignal = signal<string | null>(null);
  readonly token = computed(() => this.tokenSignal());

  private readonly storeUser = toSignal(this.store.pipe(getUserPipe), { initialValue: null });
  private readonly userSignal = signal<IUserAll | null>(null);
  readonly user = computed(() => this.userSignal());

  readonly storeDriveToken = toSignal(this.store.pipe(getDriveTokenPipe), { initialValue: undefined });
  readonly driveToken = computed(() => this.storeDriveToken());

  private readonly firebaseUser = toSignal<User | null>(user(this.auth), { initialValue: null });

  private refreshSubscription?: Subscription;
  private readonly refreshInterval = 55 * 60 * 1000; // 55 min

  constructor() {
    effect(() => {
      const token = this.storeToken();
      if (token && !this.tokenSignal()) {
        this.tokenSignal.set(token);
      }
    });

    effect(() => {
      const user = this.storeUser();
      if (user && !this.userSignal()) {
        this.userSignal.set(user);
      }
    });

    effect(() => {
      const token = this.tokenSignal();
      if (token) {
        this.startRefreshTimer();
      } else {
        this.stopRefreshTimer();
      }
    });
  }

  set setToken(token: string) {
    this.tokenSignal.set(token);
  }

  set setUser(user: IUserAll) {
    this.userSignal.set(user);
  }

  private startRefreshTimer(): void {
    if (this.refreshSubscription) {
      return;
    }

    const timer$ = timer(0, this.refreshInterval);

    this.refreshSubscription = timer$.subscribe(() => {
      const firebaseUser = this.firebaseUser();
      if (!firebaseUser) {
        return;
      }

      firebaseUser.getIdTokenResult().then(result => {
        const expirationTime = plusMinutes(newDate(result.expirationTime), -10);

        if (getNowTimeZone() >= expirationTime) {
          firebaseUser.getIdToken(true).then(newToken => {
            this.tokenSignal.set(newToken);
          });
        }
      });
    });

    this.destroyRef.onDestroy(() => this.stopRefreshTimer());
  }

  private stopRefreshTimer(): void {
    this.refreshSubscription?.unsubscribe();
    this.refreshSubscription = undefined;
  }

  clear(): void {
    this.stopRefreshTimer();
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    this.router.navigate(['/', this.translate.getCurrentLang(), 'login']);
  }
}
