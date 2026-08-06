import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUnavailable, IUnavailableAll } from '../unavailable/unavailable';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { paginated, Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class UnavailableService {

  private url = 'unavailable';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getUnavailablePage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IUnavailableAll>> => {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<Pagination<IUnavailableAll>>(toUrl(this.urlV1, 'pages'), { ...paginated(), params });
  };

  getUnavailable = (id: string): Observable<IUnavailableAll | undefined> =>
    this.http.get<IUnavailableAll>(toUrl(this.urlV1, id), { ...skipLoadingOverlay() });

  createUnavailable = (unavailable: IUnavailable): Observable<IApiResponse> => this.http.post<IApiResponse>(
    this.urlV1, unavailable);

  createBlockAgenda = (unavailable: IUnavailable): Observable<IApiResponse> => this.http.post<IApiResponse>(
    `${ this.urlV1 }/block/agenda`, unavailable);

  deleteUnavailable = (id: string): Observable<void> => this.http.delete<void>(toUrl(this.urlV1, id));

  updateUnavailable = (
    id: string,
    unavailable: IUnavailable,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    `${ this.urlV1 }/${ id }`, unavailable);
}
