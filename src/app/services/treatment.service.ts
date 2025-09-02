import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITreatment, ITreatmentAll, ITreatmentDiscountDTO, ITreatmentGroup } from '../interfaces/treatment';
import { PAGE_SIZE } from '../interfaces/pagination';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';

@Injectable()
export class TreatmentService {

  private url = 'treatments';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getTreatmentsPage = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
  ): Observable<ITreatmentGroup[]> => this.http.get<ITreatmentGroup[]>(
    toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) },
  );

  getAllTreatmentsGroup = (): Observable<ITreatmentGroup[]> => this.http.get<ITreatmentGroup[]>(
    toUrl(this.urlV1, 'groups'),
  );

  getAllTreatments = (roomId: string, customerId?: string): Observable<ITreatmentDiscountDTO[]> => {
    let params = new HttpParams().set('roomId', roomId);
    if (customerId) {
      params = params.append('customerId', customerId);
    }
    return this.http.get<ITreatmentDiscountDTO[]>(this.urlV1, { params });
  };

  getListTreatmentsGroup = (): Observable<ITreatmentGroup[]> => this.http.get<ITreatmentGroup[]>(toUrl(this.urlV1, 'list'));

  findTreatmentGroupById = (
    id: string,
  ): Observable<ITreatmentGroup | undefined> => this.http.get<ITreatmentGroup>(toUrl(this.urlV1, id));

  createTreatment = (
    treatment: ITreatmentGroup,
  ): Observable<ITreatmentGroup> => this.http.post<ITreatmentGroup>(this.urlV1, treatment);

  deleteTreatmentGroupById = (
    id: string,
  ): Observable<ITreatmentGroup> => this.http.delete<ITreatmentGroup>(toUrl(this.urlV1, id));

  updateTreatmentGroupById = (
    treatment: ITreatmentGroup,
  ): Observable<ITreatmentGroup> => this.http.patch<ITreatmentGroup>(toUrl(this.urlV1, treatment.id!), treatment);

  sortTreatment = (
    treatments: ISorted[],
  ): Observable<ITreatment[]> => this.http.patch<ITreatment[]>(toUrl(this.urlV1, 'sort'), treatments);

  sortGroupTreatment = (
    groups: ISorted[],
  ): Observable<ITreatmentGroup[]> => this.http.patch<ITreatmentGroup[]>(toUrl(this.urlV1, 'groups', 'sort'), groups);

  getAllTreatmentsHistory = (
    groupId: string,
    treatmentId: string,
  ): Observable<ITreatmentAll[] | undefined> => this.http.get<ITreatmentAll[]>(
    toUrl(this.urlV1, groupId, 'treatments', treatmentId, 'histories'),
  );
}
