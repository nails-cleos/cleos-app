import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of, timer, Subscription, Subject } from 'rxjs';
import { shareReplay, switchMap, map, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUserAll } from '../interfaces/user';

export interface RefreshTokenResponse {
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private myTokenCache: Observable<RefreshTokenResponse> | undefined;
  private readonly cacheSize = 1;
  private readonly refreshInterval = 45000; // 45 sec
  private myToken: string | undefined;
  private myUser: any;
  private myTokenSubscription: Subscription | undefined;
  private stopTimer: Subject<boolean> | undefined;

  constructor(private http: HttpClient, private router: Router) {
  }

  get tokenStream(): Observable<string> | undefined {
    return this.myTokenCache?.pipe(map(response => response.refreshToken));
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
        switchMap(() => this.refreshToken()),
        shareReplay(this.cacheSize));
      this.myTokenSubscription = this.myTokenCache.subscribe(newToken => this.myToken = newToken.refreshToken, () => this.clear());
    }
  }

  get user(): IUserAll {
    return this.myUser;
  }

  set user(user: IUserAll) {
    this.myUser = user;
  }

  public createTokenHeader(): string {
    return this.token ? `Bearer ${this.token}` : '';
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

  private createHeader(): HttpHeaders {
    let reqOptions = new HttpHeaders().set('Content-Type', 'application/json');
    if (this.token) {
      reqOptions = new HttpHeaders().set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.token}`);
    }

    return reqOptions;
  }

  private refreshToken(): Observable<RefreshTokenResponse> {
    return this.http.get<RefreshTokenResponse>('auth/refresh', {
      headers: this.createHeader()
    });
  }
}

