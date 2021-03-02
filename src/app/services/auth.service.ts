import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../interfaces/token';
import { IUser } from '../interfaces/user';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = 'auth';

  constructor(private http: HttpClient) {
  }

  public login(username: string, password: string): Observable<Token> {
    const url = `${this.authUrl}/login`;
    return this.performLogin(url, {username, password});
  }

  public socialLogin(authToken: string, provider: string): Observable<Token> {
    const url = `${this.authUrl}/social/login`;
    return this.performLogin(url, {token: authToken, provider});
  }

  public signUp(body: IUser): Observable<IUser> {
    const url = `${this.authUrl}/register`;
    return this.http.post<IUser>(url, body);
  }

  public activateAccount(token: string): Observable<any> {
    const url = `${this.authUrl}/confirm-account?token=${token}`;
    return this.http.post(url, null);
  }

  public forgotPassword(username: string): Observable<any> {
    const url = `${this.authUrl}/forgot-password`;
    return this.http.post(url, {username});
  }

  public recoveryPassword(token: string, password: string): Observable<any> {
    const url = `${this.authUrl}/recovery-password?token=${token}`;
    return this.http.post(url, {password, username: 'recovery-password'});
  }

  private performLogin(url: string, body: any): Observable<Token> {
    return this.http.post<Token>(url, body);
  }
}
