import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification, PAGE_SIZE } from '../interfaces/notification';
import { HttpClient } from '@angular/common/http';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';

@Injectable()
export class NotificationService {

  private url = 'notifications';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAll = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE
  ): Observable<INotification[]> => this.http.get<INotification[]>(toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) }
  );

  readNotification = (notificationId: string): Observable<INotification | undefined> => this.http.post<INotification>(
    toUrl(this.urlV1, notificationId),
    null
  );

  deleteNotification = (notificationId: string): Observable<INotification | undefined> => this.http.delete<INotification>(
    toUrl(this.urlV1, notificationId)
  );

  subscribe = (token: string): Observable<any> => this.http.post(toUrl(this.urlV1, 'subscribe'), { token });
}
