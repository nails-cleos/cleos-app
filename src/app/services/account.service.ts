import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAccount, ITransaction } from '../interfaces/account';
import { createFilter } from '../util/service-helper';
import { PAGE_SIZE } from '../interfaces/pagination';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private url = 'accounts';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAllTransactions(accountId: string, page: number, sort?: string, direction?: string,
                            size: number = PAGE_SIZE): Observable<ITransaction[]> {
    const params = createFilter(page, size, sort, direction);
    return this.http.get<ITransaction[]>(`${ this.urlV1 }/${ accountId }/transactions`, { params });
  }

  public getById(id: string | null): Observable<IAccount | undefined> {
    return this.http.get<IAccount>(`${ this.urlV1 }/${ id }`);
  }

  public findTransaction(id: string, transactionId: string): Observable<ITransaction | undefined> {
    return this.http.get<ITransaction>(`${ this.urlV1 }/${ id }/transactions/${ transactionId }`);
  }

  public findByCustomer(customerId: string): Observable<IAccount | undefined> {
    return this.http.get<IAccount>(`${ this.urlV1 }/customers/${ customerId }`);
  }

  public add(transaction: ITransaction, accountId: string): Observable<IAccount> {
    return this.http.post<IAccount>(`${ this.urlV1 }/${ accountId }/transactions`, transaction);
  }

  public delete(id: string | null): Observable<IAccount> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.delete<IAccount>(url);
  }

  public update(transaction: ITransaction): Observable<IAccount> {
    const url = `${ this.urlV1 }/${ transaction.accountId }`;
    return this.http.patch<IAccount>(url, transaction);
  }
}
