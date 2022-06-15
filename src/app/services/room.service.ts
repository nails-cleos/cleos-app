import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoom, IRoomInfo, IRoomService, IServicePrice } from '../interfaces/room';
import { PAGE_SIZE } from '../interfaces/pagination';

@Injectable()
export class RoomService {

  url = 'rooms';
  urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IRoom[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IRoom[]>(`${this.url}/pages`, {params});
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

  public getById(id: string | null): Observable<IRoom | undefined> {
    const url = `${this.urlV1}/${id}`;
    return this.http.get<IRoom>(url);
  }

  public add(room: IRoom): Observable<IRoom> {
    return this.http.post<IRoom>(this.url, room);
  }

  public delete(id: string | null): Observable<IRoom> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IRoom>(url);
  }

  public update(room: IRoom): Observable<IRoom> {
    const url = `${this.url}/${room.id}`;
    return this.http.patch<IRoom>(url, room);
  }

  public updateService(id: string, prices: IServicePrice[]): Observable<IServicePrice[]> {
    return this.http.patch<IServicePrice[]>(`${this.urlV1}/${id}/services`, prices);
  }
}
