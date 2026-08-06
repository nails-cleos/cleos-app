import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoom, IRoomAll, IRoomCustomer, IRoomInfo, IRoomService, IServicePrice } from '../room/room';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { paginated, Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class RoomService {

  private url = 'rooms';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getRoomsPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IRoomAll>> => this.http.get<Pagination<IRoomAll>>(
    toUrl(this.urlV1, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  loadAll = (customerId?: string): Observable<IRoomAll[]> => {
    let params;
    if (customerId) {
      params = new HttpParams().set('customerId', customerId);
    }
    return this.http.get<IRoomAll[]>(this.urlV1, { params, ...skipLoadingOverlay() });
  };

  getServices = (
    id: string,
  ): Observable<IRoomService> => this.http.get<IRoomService>(toUrl(this.urlV1, id, 'services'),
    { ...skipLoadingOverlay() });

  getAllRoomsInfo = (): Observable<IRoomInfo> => this.http.get<IRoomInfo>(toUrl(this.urlV1, 'info'),
    { ...skipLoadingOverlay() });

  getRoom = (id: string): Observable<IRoomAll | undefined> => this.http.get<IRoomAll>(toUrl(this.urlV1, id),
    { ...skipLoadingOverlay() });

  createRoom = (room: IRoom): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1, room);

  deleteRoom = (id: string): Observable<IRoom> => this.http.delete<IRoom>(toUrl(this.urlV1, id));

  updateRoom = (id: string, room: IRoom): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id), room);

  updateServices = (
    id: string,
    prices: IServicePrice[],
  ): Observable<void> => this.http.patch<void>(toUrl(this.urlV1, id, 'services'), prices);

  getAllCustomersInfo = (
    id: string,
  ): Observable<IRoomCustomer[]> => this.http.get<IRoomCustomer[]>(
    toUrl(this.urlV1, id, 'customers', 'info'),
    skipLoadingOverlay(),
  );
}
