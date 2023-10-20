import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoom, IRoomInfo, IRoomService, IServicePrice } from '../interfaces/room';
import { PAGE_SIZE } from '../interfaces/pagination';
import { createFilter } from '../util/service-helper';

@Injectable()
export class RoomService {

  private url = 'rooms';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IRoom[]> {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<IRoom[]>(`${this.urlV1}/pages`, {params});
  }

  public getAllRooms(customerId?: string): Observable<IRoom[]> {
    let params;
    if (customerId) {
      params = new HttpParams().set('customerId', customerId);
    }
    return this.http.get<IRoom[]>(this.urlV1, {params});
  }

  public getMyService(id: string): Observable<IRoomService> {
    return this.http.get<IRoomService>(`${this.urlV1}/${id}/services`);
  }

  public getRoomInfo(): Observable<IRoomInfo> {
    return this.http.get<IRoomInfo>(`${this.urlV1}/info`);
  }

  public getById(id: string | null): Observable<IRoomInfo | undefined> {
    return this.http.get<IRoomInfo>(`${this.urlV1}/${id}`);
  }

  public add(room: IRoom): Observable<IRoom> {
    return this.http.post<IRoom>(this.urlV1, room);
  }

  public delete(id: string | null): Observable<IRoom> {
    return this.http.delete<IRoom>(`${this.urlV1}/${id}`);
  }

  public update(room: IRoom): Observable<IRoom> {
    return this.http.patch<IRoom>(`${this.urlV1}/${room.id}`, room);
  }

  public updateService(id: string, prices: IServicePrice[]): Observable<IServicePrice[]> {
    return this.http.patch<IServicePrice[]>(`${this.urlV1}/${id}/services`, prices);
  }
}
