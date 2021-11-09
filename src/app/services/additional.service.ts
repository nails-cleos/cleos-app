import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IAdditional } from '../interfaces/additional';

@Injectable({
  providedIn: 'root'
})
export class AdditionalService {

  url = 'additional';

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IAdditional[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IAdditional[]>(`${this.url}/pages`, {params});
  }

  public getAllAdditional(): Observable<IAdditional[]> {
    return this.http.get<IAdditional[]>(this.url);
  }

  public getById(id: string | null): Observable<IAdditional | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IAdditional>(url);
  }

  public add(additional: IAdditional): Observable<IAdditional> {
    return this.http.post<IAdditional>(this.url, additional);
  }

  public delete(id: string | null): Observable<IAdditional> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IAdditional>(url);
  }

  public update(additional: IAdditional): Observable<IAdditional> {
    const url = `${this.url}/${additional.id}`;
    return this.http.patch<IAdditional>(url, additional);
  }
}
