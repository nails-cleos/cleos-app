import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoom, IRoomCustomer, IRoomInfo, IRoomService, IServicePrice } from '../interfaces/room';
import { PAGE_SIZE } from '../interfaces/pagination';
import { createFilter } from '../util/service-helper';
import { toUrl } from "../util/helper";

@Injectable()
export class RoomService {

  private url = 'rooms';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAll = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE
  ): Observable<IRoom[]> => this.http.get<IRoom[]>(
    toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) }
  );

  getAllRooms = (customerId?: string): Observable<IRoom[]> => {
    let params;
    if (customerId) {
      params = new HttpParams().set('customerId', customerId);
    }
    return this.http.get<IRoom[]>(this.urlV1, { params });
  };

  getMyService = (
    id: string
  ): Observable<IRoomService> => this.http.get<IRoomService>(toUrl(this.urlV1, id, 'services'));

  getRoomInfo = (): Observable<IRoomInfo> => this.http.get<IRoomInfo>(toUrl(this.urlV1, 'info'));

  getById = (id: string): Observable<IRoomInfo | undefined> => this.http.get<IRoomInfo>(toUrl(this.urlV1, id));

  add = (room: IRoom): Observable<IRoom> => this.http.post<IRoom>(this.urlV1, room);

  delete = (id: string): Observable<IRoom> => this.http.delete<IRoom>(toUrl(this.urlV1, id));

  update = (room: IRoom): Observable<IRoom> => this.http.patch<IRoom>(toUrl(this.urlV1, room.id!), room);

  updateService = (
    id: string,
    prices: IServicePrice[]
  ): Observable<IServicePrice[]> => this.http.patch<IServicePrice[]>(toUrl(this.urlV1, id, 'services'), prices);

  getCustomerInfo = (
    id: string
  ): Observable<IRoomCustomer[]> => this.http.get<IRoomCustomer[]>(toUrl(this.urlV1, id, 'customers', 'info'));
}
