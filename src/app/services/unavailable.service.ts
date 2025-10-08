import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUnavailable } from '../interfaces/unavailable';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { Pagination } from '../interfaces/pagination';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class UnavailableService {

  private url = 'unavailable';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  public getUnavailablePage(page: number, sort: string, direction: SortDirection,
    size: number): Observable<Pagination<IUnavailable>> {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<Pagination<IUnavailable>>(toUrl(this.urlV1, 'pages'), { params });
  }

  public getUnavailable(id: string): Observable<IUnavailable | undefined> {
    const url = toUrl(this.urlV1, id);
    return this.http.get<IUnavailable>(url);
  }

  public createUnavailable(unavailable: IUnavailable): Observable<IApiResponse> {
    return this.http.post<IApiResponse>(this.urlV1, unavailable);
  }

  public createBlockAgenda(unavailable: IUnavailable): Observable<IApiResponse> {
    return this.http.post<IApiResponse>(`${ this.urlV1 }/block/agenda`, unavailable);
  }

  public deleteUnavailable(id: string): Observable<IUnavailable> {
    const url = toUrl(this.urlV1, id);
    return this.http.delete<IUnavailable>(url);
  }

  public updateUnavailable(id: string, unavailable: IUnavailable): Observable<IApiResponse> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.patch<IApiResponse>(url, unavailable);
  }
}
