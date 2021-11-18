import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class MainService {

  url = 'contacts';

  constructor(private http: HttpClient) {
  }

  public sendMessage(body: any): Observable<any> {
    return this.http.post<any>(this.url, body);
  }
}
