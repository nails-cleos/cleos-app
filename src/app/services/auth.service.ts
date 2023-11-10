import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../interfaces/token';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {

  private url = 'auth';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public login(token: string, code?: string | null, theme?: string): Observable<Token> {
    const url = `${ this.urlV1 }/login`;
    return this.http.post<Token>(url, { token, code, theme });
  }
}
