import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IColor } from '../interfaces/color';

@Injectable()
export class ColorService {

  private url = 'colors';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IColor[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IColor[]>(`${ this.urlV1 }/pages`, { params });
  }

  public getAllByTreatmentId(treatmentId: string): Observable<IColor[]> {
    return this.http.get<IColor[]>(`${ this.urlV1 }/treatments/${ treatmentId }`);
  }

  public getAllColors(): Observable<IColor[]> {
    return this.http.get<IColor[]>(this.urlV1);
  }

  public getById(id: string | null): Observable<IColor | undefined> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.get<IColor>(url);
  }

  public add(color: IColor): Observable<IColor> {
    return this.http.post<IColor>(this.urlV1, color);
  }

  public delete(id: string | null): Observable<IColor> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.delete<IColor>(url);
  }

  public update(color: IColor): Observable<IColor> {
    const url = `${ this.urlV1 }/${ color.id }`;
    return this.http.patch<IColor>(url, color);
  }
}
