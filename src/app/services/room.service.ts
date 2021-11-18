import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoom } from '../interfaces/room';
import { PAGE_SIZE } from '../interfaces/pagination';

@Injectable()
export class RoomService {

  url = 'rooms';

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

  public getAllRooms(): Observable<IRoom[]> {
    return this.http.get<IRoom[]>(this.url);
  }

  public getMyRoom(): Observable<IRoom> {
    return this.http.get<IRoom>(`${this.url}/me`);
  }

  public getById(id: string | null): Observable<IRoom | undefined> {
    const url = `${this.url}/${id}`;
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
}
