import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IOffice } from '../interfaces/office';

@Injectable({
  providedIn: 'root'
})
export class OfficeService {

  private url = 'offices';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IOffice[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IOffice[]>(`${this.urlV1}/pages`, {params});
  }

  public getAllOffice(): Observable<IOffice[]> {
    return this.http.get<IOffice[]>(this.urlV1);
  }

  public getById(id: string | null): Observable<IOffice | undefined> {
    const url = `${this.urlV1}/${id}`;
    return this.http.get<IOffice>(url);
  }

  public add(office: IOffice): Observable<IOffice> {
    return this.http.post<IOffice>(this.urlV1, office);
  }

  public delete(id: string | null): Observable<IOffice> {
    const url = `${this.urlV1}/${id}`;
    return this.http.delete<IOffice>(url);
  }

  public update(office: IOffice): Observable<IOffice> {
    const url = `${this.urlV1}/${office.id}`;
    return this.http.patch<IOffice>(url, office);
  }
}
