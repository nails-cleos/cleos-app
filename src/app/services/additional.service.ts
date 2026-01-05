import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pagination } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class AdditionalService {

  private url = 'additional';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAdditionalPage = (
    sort: string,
    direction: SortDirection,
    page: number,
    size: number,
  ): Observable<Pagination<IAdditional>> => this.http.get<Pagination<IAdditional>>(
    toUrl(this.urlV1, 'pages'), { params: createFilter(page, size, sort, direction) },
  );

  getAllAdditionalByGroupId = (roomId: string, groupId: string): Observable<IAdditionalAll[]> =>
    this.http.get<IAdditionalAll[]>(toUrl(this.urlV1, 'groups'),
      { params: new HttpParams().set('roomId', roomId).set('groupId', groupId) },
    );

  getAdditionalList = (): Observable<IAdditionalAll[]> => this.http.get<IAdditionalAll[]>(this.urlV1);

  getAdditional = (id: string): Observable<IAdditional | undefined> => this.http.get<IAdditional>(
    toUrl(this.urlV1, id));

  createAdditional = (additional: IAdditional): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1,
    additional);

  deleteAdditional = (id: string): Observable<IAdditional> => this.http.delete<IAdditional>(toUrl(this.urlV1, id));

  updateAdditional = (id: string, additional: IAdditional): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id), additional,
  );

  sortAdditional = (additionalList: ISorted[]): Observable<IAdditionalAll[]> => this.http.patch<IAdditionalAll[]>(
    this.urlV1, additionalList,
  );
}
