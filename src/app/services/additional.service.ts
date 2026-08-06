import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { paginated, Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IAdditional, IAdditionalAll } from '../additional/additional';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class AdditionalService {

  private url = 'additional';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAdditionalPage = (
    sort: string,
    direction: SortDirection,
    page: number,
    size: number,
  ): Observable<Pagination<IAdditionalAll>> => this.http.get<Pagination<IAdditionalAll>>(
    toUrl(this.urlV1, 'pages'), { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  getAllAdditionalByGroupId = (roomId: string, groupId: string): Observable<IAdditionalAll[]> =>
    this.http.get<IAdditionalAll[]>(toUrl(this.urlV1, 'groups'),
      { params: new HttpParams().set('roomId', roomId).set('groupId', groupId), ...skipLoadingOverlay() },
    );

  getAdditionalList = (): Observable<IAdditionalAll[]> => this.http.get<IAdditionalAll[]>(this.urlV1,
    { ...skipLoadingOverlay() });

  getAdditional = (id: string): Observable<IAdditionalAll | undefined> => this.http.get<IAdditionalAll>(
    toUrl(this.urlV1, id), { ...skipLoadingOverlay() });

  createAdditional = (additional: IAdditional): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1,
    additional);

  deleteAdditional = (id: string): Observable<void> => this.http.delete<void>(toUrl(this.urlV1, id));

  updateAdditional = (id: string, additional: IAdditional): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id), additional,
  );

  sortAdditional = (additionalList: ISorted[]): Observable<void> => this.http.patch<void>(
    this.urlV1, additionalList,
  );
}
