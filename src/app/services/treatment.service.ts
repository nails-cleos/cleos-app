import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITreatmentAll, ITreatmentDiscountDTO, ITreatmentGroup } from '../interfaces/treatment';
import { PAGE_SIZE } from '../interfaces/pagination';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';

@Injectable()
export class TreatmentService {

  private url = 'treatments';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<ITreatmentGroup[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<ITreatmentGroup[]>(`${ this.urlV1 }/pages`, { params });
  }

  public getAllTreatmentGroup(): Observable<ITreatmentGroup[]> {
    return this.http.get<ITreatmentGroup[]>(`${ this.urlV1 }/groups`);
  }

  public getAllTreatments(roomId: string, customerId?: string): Observable<ITreatmentDiscountDTO[]> {
    let params = new HttpParams().set('roomId', roomId);
    if (customerId) {
      params = params.append('customerId', customerId);
    }
    return this.http.get<ITreatmentDiscountDTO[]>(this.urlV1, { params });
  }

  public getTreatmentList(): Observable<ITreatmentGroup[]> {
    return this.http.get<ITreatmentGroup[]>(`${ this.urlV1 }/list`);
  }

  public getById(id: string | null): Observable<ITreatmentGroup | undefined> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.get<ITreatmentGroup>(url);
  }

  public add(treatment: ITreatmentGroup): Observable<ITreatmentGroup> {
    return this.http.post<ITreatmentGroup>(this.urlV1, treatment);
  }

  public delete(id: string | null): Observable<ITreatmentGroup> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.delete<ITreatmentGroup>(url);
  }

  public update(treatment: ITreatmentGroup): Observable<ITreatmentGroup> {
    return this.http.patch<ITreatmentGroup>(`${ this.urlV1 }/${ treatment.id }`, treatment);
  }

  public updateSort(treatment: ISorted[]): Observable<ITreatmentGroup[]> {
    return this.http.patch<ITreatmentGroup[]>(`${ this.urlV1 }/groups`, treatment);
  }

  public getHistory(id: string, treatmentId: string): Observable<ITreatmentAll[] | undefined> {
    const url = `${ this.urlV1 }/${ id }/treatments/${ treatmentId }/histories`;
    return this.http.get<ITreatmentAll[]>(url);
  }
}
