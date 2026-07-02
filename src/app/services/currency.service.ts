import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { paginated, Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { ICurrency, ICurrencyAll } from '../currency/currency';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class CurrencyService {

  private url = 'currency';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getCurrenciesPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<ICurrency>> => this.http.get<Pagination<ICurrency>>(
    toUrl(this.urlV1, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  getAllCurrency = (): Observable<ICurrency[]> => this.http.get<ICurrency[]>(this.urlV1);

  getCurrency = (id: string): Observable<ICurrencyAll | undefined> => this.http.get<ICurrencyAll>(
    toUrl(this.urlV1, id), { ...skipLoadingOverlay() });

  createCurrency = (currency: ICurrency): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1,
    currency);

  deleteCurrency = (id: string): Observable<void> => this.http.delete<void>(toUrl(this.urlV1, id));

  updateCurrency = (id: string, currency: ICurrency): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id), currency,
  );
}
