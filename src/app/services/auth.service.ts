import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../interfaces/token';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  public login(username: string, password: string): Observable<Token> {
    return this.performLogin('auth/login', {username, password});
  }

  public socialLogin(authToken: string, provider: string): Observable<Token> {
    return this.performLogin('auth/social/login', {token: authToken, provider});
  }

  signUp(body: IUser): Observable<IUser> {
    return this.http.post<IUser>('auth/register', body);
  }

  private performLogin(url: string, body: any): Observable<Token> {
    return this.http.post<Token>(url, body);
  }
}
