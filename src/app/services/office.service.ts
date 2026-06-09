import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { paginated, Pagination } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IOffice, IOfficeAll } from '../office/office';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class OfficeService {

  private url = 'offices';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  getAllMyOffices = (): Observable<IOfficeAll[]> => this.http.get<IOfficeAll[]>(toUrl(this.urlV1, 'me'));

  getOfficesPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IOfficeAll>> => this.http.get<Pagination<IOfficeAll>>(
    toUrl(this.urlV1, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  getOffice = (id: string): Observable<IOfficeAll | undefined> => this.http.get<IOfficeAll>(toUrl(this.urlV1, id));

  createOffice = (office: IOffice): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1, office);

  deleteOffice = (id: string): Observable<IOffice> => this.http.delete<IOffice>(toUrl(this.urlV1, id));

  updateOffice = (
    id: string,
    office: IOffice,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.urlV1, id), office);
}
