import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription, timer } from 'rxjs';

import { IUserAll } from '../interfaces/user';
import { getNowTimeZone, newDate, plusMinutes } from '../util/dates';
import { getDriveTokenPipe } from '../store/selectors/auth.selectors';
import { AuthState } from '../store/reducers/auth.reducers';
import { Store } from '@ngrx/store';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store<AuthState>);
  private readonly firebaseService = inject(FirebaseService);

  private readonly tokenSignal = signal<string | null>(null);
  readonly token = computed(() => this.tokenSignal());

  private readonly userSignal = signal<IUserAll | null>(null);
  readonly user = computed(() => this.userSignal());

  readonly storeDriveToken = toSignal(this.store.pipe(getDriveTokenPipe), { initialValue: undefined });
  readonly driveToken = computed(() => this.storeDriveToken());

  private refreshSubscription?: Subscription;
  private readonly refreshInterval = 55 * 60 * 1000; // 55 min

  constructor() {
    effect(() => {
      const fbUser = this.firebaseService.user();
      if (!fbUser) {
        this.clear();
        return;
      }

      fbUser.getIdToken().then(token => {
        this.tokenSignal.set(token);
      });
    });

    effect(() => {
      const token = this.tokenSignal();
      if (token === null) {
        this.stopRefreshTimer();
        return;
      } else {
        this.startRefreshTimer();
      }
    });
  }

  set setUser(user: IUserAll) {
    this.userSignal.set(user);
  }

  private startRefreshTimer(): void {
    if (this.refreshSubscription) {
      return;
    }

    this.refreshSubscription = timer(0, this.refreshInterval).subscribe(
      async () => {
        const result = await this.firebaseService.idTokenResult;
        if (!result) {
          return;
        }

        const refreshAt = plusMinutes(newDate(result.expirationTime), -10);

        if (getNowTimeZone() >= refreshAt) {
          const newToken = await this.firebaseService.getIdToken(true);
          this.tokenSignal.set(newToken);
        }
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
  }
}
