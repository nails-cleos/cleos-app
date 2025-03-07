import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUnavailable } from '../interfaces/unavailable';
import { PAGE_SIZE } from '../interfaces/pagination';
import { createFilter } from '../util/service-helper';
import { toUrl } from "../util/helper";

@Injectable()
export class UnavailableService {

  private url = 'unavailable';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IUnavailable[]> {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<IUnavailable[]>(toUrl(this.urlV1, 'pages'), { params });
  }

  public getById(id: string): Observable<IUnavailable | undefined> {
    const url = toUrl(this.urlV1, id);
    return this.http.get<IUnavailable>(url);
  }

  public add(unavailable: IUnavailable): Observable<IUnavailable> {
    return this.http.post<IUnavailable>(this.urlV1, unavailable);
  }

  public blockAgenda(unavailable: IUnavailable): Observable<IUnavailable> {
    return this.http.post<IUnavailable>(`${ this.urlV1 }/block/agenda`, unavailable);
  }

  public delete(id: string): Observable<IUnavailable> {
    const url = toUrl(this.urlV1, id);
    return this.http.delete<IUnavailable>(url);
  }

  public update(unavailable: IUnavailable): Observable<IUnavailable> {
    const url = `${ this.urlV1 }/${ unavailable.id }`;
    return this.http.patch<IUnavailable>(url, unavailable);
  }
}
