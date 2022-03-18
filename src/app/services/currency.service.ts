import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { ICurrency } from '../interfaces/currency';

@Injectable()
export class CurrencyService {

  url = 'currency';
  urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<ICurrency[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<ICurrency[]>(`${this.urlV1}/pages`, {params});
  }

  public getAllCurrency(): Observable<ICurrency[]> {
    return this.http.get<ICurrency[]>(this.urlV1);
  }

  public getById(id: string | null): Observable<ICurrency | undefined> {
    const url = `${this.urlV1}/${id}`;
    return this.http.get<ICurrency>(url);
  }

  public add(currency: ICurrency): Observable<ICurrency> {
    return this.http.post<ICurrency>(this.urlV1, currency);
  }

  public delete(id: string | null): Observable<ICurrency> {
    const url = `${this.urlV1}/${id}`;
    return this.http.delete<ICurrency>(url);
  }

  public update(currency: ICurrency): Observable<ICurrency> {
    const url = `${this.urlV1}/${currency.id}`;
    return this.http.patch<ICurrency>(url, currency);
  }
}
