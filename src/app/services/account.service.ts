import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAccountAll, IAccountTransaction, ITransaction } from '../interfaces/account';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private url = 'accounts';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  getTransactionsByAccountId = (
    id: string,
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<IAccountTransaction> => this.http.get<IAccountTransaction>(
    toUrl(this.urlV1, id, 'transactions'),
    { params: createFilter(page, size, sort, direction) },
  );

  getAccount = (id: string): Observable<IAccountAll | undefined> => this.http.get<IAccountAll>(toUrl(this.urlV1, id));

  getTransaction = (
    id: string,
    transactionId: string,
  ): Observable<ITransaction | undefined> => this.http.get<ITransaction>(
    toUrl(this.urlV1, id, 'transactions', transactionId));

  getAccountByCustomerId = (
    customerId: string,
  ): Observable<IAccountAll | undefined> => this.http.get<IAccountAll>(toUrl(this.urlV1, 'customers', customerId));

  createTransaction = (id: string, transaction: ITransaction): Observable<IApiResponse> => this.http.post<IApiResponse>(
    toUrl(this.urlV1, id, 'transactions'), transaction);

  updateAccount = (id: string, transaction: ITransaction): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id), transaction);
}
