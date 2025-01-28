import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUserAll } from '../interfaces/user';
import { Auth, user } from '@angular/fire/auth';
import { User } from '@firebase/auth';
import { getNowTimeZone, newDate, plusMinutes } from '../util/dates';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TokenService {
  private myTokenCache?: Observable<User | null>;
  private readonly cacheSize: number;
  private readonly refreshInterval: number;
  private myToken?: string;
  private myUser: any;
  private myTokenSubscription?: Subscription;
  private stopTimer?: Subject<boolean>;

  constructor(private readonly translate: TranslateService, private router: Router, private auth: Auth) {
    this.cacheSize = 1;
    this.refreshInterval = 55 * 60 * 1000; // 5 min
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
          if (getNowTimeZone() >= expirationTime) {
            firebaseUser.getIdToken(true).then(newToken => this.myToken = newToken);
          }
        }),
        error: () => this.clear(),
        complete: () => this.clear()
      });
    }
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
    this.router.navigate(['/', this.translate.currentLang, 'login']);
  }
}

