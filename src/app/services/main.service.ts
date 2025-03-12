import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class MainService {

  private url = 'contacts';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  sendMessage = (body: any): Observable<any> => this.http.post<any>(this.urlV1, body);
}
