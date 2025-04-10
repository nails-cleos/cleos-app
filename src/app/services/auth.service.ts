import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from '../interfaces/token';
import { Observable } from 'rxjs';
import { toUrl } from '../util/helper';

@Injectable()
export class AuthService {

  private url = 'auth';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  login = (token: string, code?: string | null, theme?: string): Observable<Token> => this.http.post<Token>(
    toUrl(this.urlV1, 'login'), { token, code, theme },
  );
}
