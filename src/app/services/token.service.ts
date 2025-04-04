import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUserAll } from '../interfaces/user';
import { Auth, user } from '@angular/fire/auth';
import { User } from '@firebase/auth';
import { getNowTimeZone, newDate, plusMinutes } from '../util/dates';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private myTokenCache?: Observable<User | null>;
  private readonly cacheSize: number = 1;
  private readonly refreshInterval: number = 55 * 60 * 1000; // 5 min;
  private myUser: any;
  private myTokenSubscription?: Subscription;
  private stopTimer?: Subject<boolean>;
  private _token$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private translate: TranslateService = inject(TranslateService);
  private router: Router = inject(Router);
  private auth: Auth = inject(Auth);

  get user(): IUserAll {
    return this.myUser;
  }

  set user(myUser: IUserAll) {
    this.myUser = myUser;
  }

  get token(): string | null {
    return this._token$.value;
  }

  set token(token: string) {
    this._token$.next(token);
    if (token && !this.myTokenCache) {
      const myStopTimer = new Subject<boolean>();
      this.stopTimer = myStopTimer;
      const myTimer = timer(0, this.refreshInterval);
      this.myTokenCache = myTimer.pipe(
        takeUntil(myStopTimer),
        switchMap(() => user(this.auth)),
        shareReplay(this.cacheSize)
      );

      this.myTokenSubscription = this.myTokenCache.subscribe({
        next: (firebaseUser) => {
          firebaseUser?.getIdTokenResult().then(tokenResult => {
            const expirationTime = plusMinutes(newDate(tokenResult.expirationTime), -10);
            if (getNowTimeZone() >= expirationTime) {
              firebaseUser.getIdToken(true).then(newToken => {
                this._token$.next(newToken);
              });
            }
          });
        },
        error: () => this.clear(),
        complete: () => this.clear()
      });
    }
  }

  clear = (): void => {
    if (this.myTokenSubscription) {
      this.myTokenSubscription.unsubscribe();
    }
    if (this.stopTimer) {
      this.stopTimer.next(true);
      this.stopTimer = undefined;
    }
    this.myTokenCache = undefined;
    this._token$.next(null);
    this.myUser = undefined;
    this.router.navigate(['/', this.translate.currentLang, 'login']);
  };
}
