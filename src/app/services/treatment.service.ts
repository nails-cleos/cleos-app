import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITreatmentAll, ITreatmentDiscountDTO, ITreatmentGroup, ITreatmentGroupAll } from '../treatment/treatment';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { paginated, Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class TreatmentService {

  private url = 'treatments';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getTreatmentsPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<ITreatmentGroupAll>> => this.http.get<Pagination<ITreatmentGroupAll>>(
    toUrl(this.urlV1, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  getAllTreatmentsGroup = (): Observable<ITreatmentGroupAll[]> => this.http.get<ITreatmentGroupAll[]>(
    toUrl(this.urlV1, 'groups'), { ...skipLoadingOverlay() },
  );

  getAllTreatments = (roomId: string, customerId?: string): Observable<ITreatmentDiscountDTO> => {
    let params = new HttpParams().set('roomId', roomId);
    if (customerId) {
      params = params.append('customerId', customerId);
    }
    return this.http.get<ITreatmentDiscountDTO>(this.urlV1, { params, ...skipLoadingOverlay() });
  };

  getTreatmentGroup = (
    id: string,
  ): Observable<ITreatmentGroupAll | undefined> => this.http.get<ITreatmentGroupAll>(toUrl(this.urlV1, id),
    { ...skipLoadingOverlay() });

  createTreatment = (
    treatmentGroup: ITreatmentGroup,
  ): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1, treatmentGroup);

  deleteTreatmentGroup = (
    id: string,
  ): Observable<ITreatmentGroup> => this.http.delete<ITreatmentGroup>(toUrl(this.urlV1, id));

  updateTreatmentGroup = (
    id: string,
    treatmentGroup: ITreatmentGroup,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.urlV1, id), treatmentGroup);

  sortTreatment = (
    treatments: ISorted[],
  ): Observable<void> => this.http.patch<void>(toUrl(this.urlV1, 'sort'), treatments);

  sortGroupTreatment = (
    groups: ISorted[],
  ): Observable<ITreatmentGroup[]> => this.http.patch<ITreatmentGroup[]>(toUrl(this.urlV1, 'groups', 'sort'), groups);

  getAllTreatmentsHistory = (
    groupId: string,
    treatmentId: string,
  ): Observable<ITreatmentAll[]> => this.http.get<ITreatmentAll[]>(
    toUrl(this.urlV1, groupId, 'treatments', treatmentId, 'histories'), { ...skipLoadingOverlay() },
  );
}
