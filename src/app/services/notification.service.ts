import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification, PAGE_SIZE } from '../interfaces/notification';
import { HttpClient } from '@angular/common/http';
import { createFilter } from '../util/service-helper';

@Injectable()
export class NotificationService {

  private url = 'notifications';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<INotification[]> {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<INotification[]>(`${ this.urlV1 }/pages`, { params });
  }

  public readNotification(notificationId: string): Observable<INotification | undefined> {
    const url = `${ this.urlV1 }/${ notificationId }`;
    return this.http.post<INotification>(url, null);
  }

  public deleteNotification(notificationId: string): Observable<INotification | undefined> {
    const url = `${ this.urlV1 }/${ notificationId }`;
    return this.http.delete<INotification>(url);
  }

  public subscribe(token: string): Observable<any> {
    const url = `${ this.urlV1 }/subscribe`;
    return this.http.post(url, { token });
  }
}
