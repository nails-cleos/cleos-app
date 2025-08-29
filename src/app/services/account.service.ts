import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAccount, ITransaction } from '../interfaces/account';
import { createFilter } from '../util/service-helper';
import { PAGE_SIZE } from '../interfaces/pagination';
import { toUrl } from '../util/helper';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private url = 'accounts';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getTransactionsByAccountId = (
    accountId: string,
    page: number,
    sort?: string,
    direction?: string,
    size: number = PAGE_SIZE,
  ): Observable<ITransaction[]> => this.http.get<ITransaction[]>(
    toUrl(this.urlV1, accountId, 'transactions'),
    { params: createFilter(page, size, sort, direction) },
  );

  findAccountById = (id: string): Observable<IAccount | undefined> => this.http.get<IAccount>(toUrl(this.urlV1, id));

  findTransactionById = (
    id: string,
    transactionId: string,
  ): Observable<ITransaction | undefined> => this.http.get<ITransaction>(
    toUrl(this.urlV1, id, 'transactions', transactionId));

  findAccountByCustomerId = (
    customerId: string,
  ): Observable<IAccount | undefined> => this.http.get<IAccount>(toUrl(this.urlV1, 'customers', customerId));

  addMoney = (transaction: ITransaction, accountId: string): Observable<IAccount> => this.http.post<IAccount>(
    toUrl(this.urlV1, accountId, 'transactions'), transaction);

  updateAccountById = (transaction: ITransaction): Observable<IAccount> => this.http.patch<IAccount>(
    toUrl(this.urlV1, transaction.accountId!), transaction);
}
