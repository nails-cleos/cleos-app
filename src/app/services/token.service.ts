import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUserAll } from '../interfaces/user';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.states';
import { Auth, user } from '@angular/fire/auth';
import { User } from '@firebase/auth';
import { getNow, newDate, plusMinutes } from '../util/dates';

@Injectable()
export class TokenService {
  private myTokenCache?: Observable<User | null>;
  private readonly cacheSize = 1;
  private readonly refreshInterval = 5 * 60 * 1000; // 5 min
  private myToken?: string;
  private myUser: any;
  private myTokenSubscription?: Subscription;
  private stopTimer?: Subject<boolean>;

  constructor(private http: HttpClient, private router: Router, private store: Store<AppState>, private auth: Auth) {
  }

  get user(): IUserAll {
    return this.myUser;
  }

  set user(myUser: IUserAll) {
    this.myUser = myUser;
  }

  get token(): string {
    return this.myToken ? this.myToken : '';
  }

  set token(token: string) {
    this.myToken = token;
    if (token && !this.myTokenCache) {
      const myStopTimer = new Subject<boolean>();
      this.stopTimer = myStopTimer;
      const myTimer = timer(0, this.refreshInterval);
      this.myTokenCache = myTimer.pipe(
        takeUntil(myStopTimer),
        switchMap(() => user(this.auth)),
        shareReplay(this.cacheSize));
      this.myTokenSubscription = this.myTokenCache.subscribe({
        next: (firebaseUser) => firebaseUser?.getIdTokenResult().then(tokenResult => {
          const expirationTime = plusMinutes(newDate(tokenResult.expirationTime), -10);
          if (getNow() >= expirationTime) {
              firebaseUser.getIdToken(true).then(newToken => this.myToken = newToken);
          }
        }),
        error: () => this.clear(),
        complete: () => this.clear()
      });
    }
  }

  public createTokenHeader(): string {
    return this.token ? this.token : '';
  }

  public clear(): void {
    if (this.myTokenSubscription) {
      this.myTokenSubscription.unsubscribe();
    }
    if (this.stopTimer) {
      this.stopTimer.next(true);
      this.stopTimer = undefined;
    }
    this.myTokenCache = undefined;
    this.myToken = undefined;
    this.myUser = undefined;
    this.router.navigate(['/login']);
  }
}

