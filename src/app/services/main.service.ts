import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISendMessage } from '../../main';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private url = 'contacts';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  sendMessage = (body: ISendMessage): Observable<void> =>
    this.http.post<void>(this.urlV1, body);
}
