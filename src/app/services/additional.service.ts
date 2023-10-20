import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createFilter } from '../util/service-helper';

@Injectable()
export class AdditionalService {

  private url = 'additional';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IAdditional[]> {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<IAdditional[]>(`${ this.urlV1 }/pages`, { params });
  }

  public getAllAdditional(roomId: string, groupId: string): Observable<IAdditional[]> {
    const params = new HttpParams().set('roomId', roomId).set('groupId', groupId);
    return this.http.get<IAdditional[]>(`${ this.urlV1 }/groups`, { params });
  }

  public getAdditionalList(): Observable<IAdditionalAll[]> {
    return this.http.get<IAdditionalAll[]>(this.urlV1);
  }

  public getById(id: string | null): Observable<IAdditional | undefined> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.get<IAdditional>(url);
  }

  public add(additional: IAdditional): Observable<IAdditional> {
    return this.http.post<IAdditional>(this.urlV1, additional);
  }

  public delete(id: string | null): Observable<IAdditional> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.delete<IAdditional>(url);
  }

  public update(additional: IAdditional): Observable<IAdditional> {
    const url = `${ this.urlV1 }/${ additional.id }`;
    return this.http.patch<IAdditional>(url, additional);
  }

  public updateSort(additionalList: ISorted[]): Observable<IAdditionalAll[]> {
    return this.http.patch<IAdditionalAll[]>(this.urlV1, additionalList);
  }
}
