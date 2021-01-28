import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoom, PAGE_SIZE } from '../interfaces/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  url = 'rooms';

  constructor(private http: HttpClient) {
  }

  getAll(sort: string, direction: string, page: number): Observable<IRoom[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(PAGE_SIZE));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IRoom[]>(`${this.url}/pages`, {params});
  }

  getAllRooms(): Observable<IRoom[]> {
    return this.http.get<IRoom[]>(this.url);
  }

  getById(id: string | null): Observable<IRoom | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IRoom>(url);
  }

  add(product: IRoom): Observable<IRoom> {
    return this.http.post<IRoom>(this.url, product);
  }

  delete(id: string | null): Observable<IRoom> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IRoom>(url);
  }

  update(product: IRoom): Observable<IRoom> {
    const url = `${this.url}/${product.id}`;
    return this.http.patch<IRoom>(url, product);
  }
}
