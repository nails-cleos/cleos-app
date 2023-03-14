import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification, PAGE_SIZE } from '../interfaces/notification';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class NotificationService {

  private url = 'notifications';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number): Observable<INotification[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(PAGE_SIZE));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }
    return this.http.get<INotification[]>(`${this.urlV1}/pages`, {params});
  }

  public readNotification(notificationId: string): Observable<INotification | undefined> {
    const url = `${this.urlV1}/${notificationId}`;
    return this.http.post<INotification>(url, null);
  }

  public subscribe(token: string): Observable<any> {
    const url = `${this.urlV1}/subscribe`;
    return this.http.post(url, {token});
  }
}
