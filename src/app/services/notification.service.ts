import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification, PAGE_SIZE } from '../interfaces/notification';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class NotificationService {

  private url = 'notifications';

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
    return this.http.get<INotification[]>(`${this.url}/pages`, {params});
  }

  public readNotification(notificationId: string): Observable<INotification | undefined> {
    const url = `${this.url}/${notificationId}`;
    return this.http.post<INotification>(url, null);
  }

  public subscribe(token: string): Observable<any> {
    const url = `${this.url}/subscribe`;
    return this.http.post(url, {token});
  }
}
