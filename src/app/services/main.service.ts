import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  url = 'contacts';

  constructor(private http: HttpClient) {
  }

  public sendMessage(body: any): Observable<any> {
    return this.http.post<any>(this.url, body);
  }
}
