import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { ICurrency } from '../interfaces/currency';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';

@Injectable()
export class CurrencyService {

  private url = 'currency';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getCurrenciesPage = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
  ): Observable<ICurrency[]> => this.http.get<ICurrency[]>(
    toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) },
  );

  getAllCurrency = (): Observable<ICurrency[]> => this.http.get<ICurrency[]>(this.urlV1);

  findCurrencyById = (id: string): Observable<ICurrency | undefined> => this.http.get<ICurrency>(toUrl(this.urlV1, id));

  createCurrency = (currency: ICurrency): Observable<ICurrency> => this.http.post<ICurrency>(this.urlV1, currency);

  deleteCurrencyById = (id: string): Observable<ICurrency> => this.http.delete<ICurrency>(toUrl(this.urlV1, id));

  updateCurrencyById = (currency: ICurrency): Observable<ICurrency> => this.http.patch<ICurrency>(
    toUrl(this.urlV1, currency.id!), currency,
  );
}
