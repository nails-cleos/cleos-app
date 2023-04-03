import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../interfaces/token';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {

  private url = 'auth';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public login(username: string, password: string): Observable<Token> {
    const url = `${this.urlV1}/login`;
    return this.performLogin(url, {username, password});
  }

  public socialLogin(authToken: string, provider: string, code: string | undefined | null,
                     theme: string | undefined): Observable<Token> {
    const url = `${this.urlV1}/social/login`;
    return this.performLogin(url, {token: authToken, provider, code, theme});
  }

  public signUp(body: IUser): Observable<IUser> {
    const url = `${this.urlV1}/register`;
    return this.http.post<IUser>(url, body);
  }

  public activateAccount(token: string): Observable<any> {
    const url = `${this.urlV1}/confirm-account?token=${token}`;
    return this.http.post(url, null);
  }

  public forgotPassword(username: string): Observable<any> {
    const url = `${this.urlV1}/forgot-password`;
    return this.http.post(url, {username});
  }

  public recoveryPassword(token: string, password: string): Observable<any> {
    const url = `${this.urlV1}/recovery-password?token=${token}`;
    return this.http.post(url, {password, username: 'recovery-password'});
  }

  private performLogin(url: string, body: any): Observable<Token> {
    return this.http.post<Token>(url, body);
  }
}
