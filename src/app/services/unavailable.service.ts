import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUnavailable } from '../interfaces/unavailable';
import { PAGE_SIZE } from '../interfaces/pagination';

@Injectable()
export class UnavailableService {

  private url = 'unavailable';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IUnavailable[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IUnavailable[]>(`${this.urlV1}/pages`, {params});
  }

  public getById(id: string | null): Observable<IUnavailable | undefined> {
    const url = `${this.urlV1}/${id}`;
    return this.http.get<IUnavailable>(url);
  }

  public add(unavailable: IUnavailable): Observable<IUnavailable> {
    return this.http.post<IUnavailable>(this.urlV1, unavailable);
  }

  public delete(id: string | null): Observable<IUnavailable> {
    const url = `${this.urlV1}/${id}`;
    return this.http.delete<IUnavailable>(url);
  }

  public update(unavailable: IUnavailable): Observable<IUnavailable> {
    const url = `${this.urlV1}/${unavailable.id}`;
    return this.http.patch<IUnavailable>(url, unavailable);
  }
}
