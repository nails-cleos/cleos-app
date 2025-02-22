import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITreatment, ITreatmentAll, ITreatmentDiscountDTO, ITreatmentGroup } from '../interfaces/treatment';
import { PAGE_SIZE } from '../interfaces/pagination';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createFilter } from '../util/service-helper';
import { toUrl } from "../util/helper";

@Injectable()
export class TreatmentService {

  private url = 'treatments';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  getAll = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE
  ): Observable<ITreatmentGroup[]> => {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<ITreatmentGroup[]>(toUrl(this.urlV1, 'pages'), { params });
  }

  getAllTreatmentGroup = (): Observable<ITreatmentGroup[]> => this.http.get<ITreatmentGroup[]>(`${ this.urlV1 }/groups`)

  getAllTreatments = (roomId: string, customerId?: string): Observable<ITreatmentDiscountDTO[]> => {
    let params = new HttpParams().set('roomId', roomId);
    if (customerId) {
      params = params.append('customerId', customerId);
    }
    return this.http.get<ITreatmentDiscountDTO[]>(this.urlV1, { params });
  }

  getTreatmentList = (): Observable<ITreatmentGroup[]> => this.http.get<ITreatmentGroup[]>(`${ this.urlV1 }/list`)

  getById = (
    id: string
  ): Observable<ITreatmentGroup | undefined> => this.http.get<ITreatmentGroup>(toUrl(this.urlV1, id))

  add = (
    treatment: ITreatmentGroup
  ): Observable<ITreatmentGroup> => this.http.post<ITreatmentGroup>(this.urlV1, treatment)

  delete = (
    id: string
  ): Observable<ITreatmentGroup> => this.http.delete<ITreatmentGroup>(toUrl(this.urlV1, id))

  update = (
    treatment: ITreatmentGroup
  ): Observable<ITreatmentGroup> => this.http.patch<ITreatmentGroup>(toUrl(this.urlV1, treatment.id!!), treatment)

  updateSort = (
    treatments: ISorted[]
  ): Observable<ITreatment[]> => this.http.patch<ITreatment[]>(toUrl(this.urlV1, 'sort'), treatments)

  updateGroupSort = (
    groups: ISorted[]
  ): Observable<ITreatmentGroup[]> => this.http.patch<ITreatmentGroup[]>(toUrl(this.urlV1, 'groups', 'sort'), groups)

  getHistory = (
    groupId: string,
    treatmentId: string
  ): Observable<ITreatmentAll[] | undefined> => this.http.get<ITreatmentAll[]>(
    toUrl(this.urlV1, groupId, 'treatments', treatmentId, 'histories'))
}
