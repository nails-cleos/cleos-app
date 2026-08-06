import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification, INotificationDTO } from '../notification/notification';
import { HttpClient } from '@angular/common/http';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { paginated } from '../interfaces/pagination';
import { SortDirection } from '@angular/material/sort';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private url = 'notifications';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getNotificationsPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<INotificationDTO> => this.http.get<INotificationDTO>(toUrl(this.urlV1, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  readNotification = (
    notificationId: string,
  ): Observable<INotification | undefined> => this.http.post<INotification>(
    toUrl(this.urlV1, notificationId),
    null,
  );

  deleteNotification = (
    id: string,
  ): Observable<void> => this.http.delete<void>(toUrl(this.urlV1, id));

  subscribeNotification = (token: string): Observable<any> => this.http.post(toUrl(this.urlV1, 'subscribe'), { token });
}
