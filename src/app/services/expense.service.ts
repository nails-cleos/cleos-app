import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IExpense, IExpenseAll, IExpenseInfo } from '../interfaces/expense';
import { createFilter } from '../util/service-helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';

@Injectable()
export class ExpenseService {

  private urlV1 = 'v1/rooms/{roomId}/expenses';

  private http: HttpClient = inject(HttpClient);

  public getExpensesPage = (
    roomId: string,
    sort: string,
    direction: SortDirection,
    page: number,
    size: number,
    filter?: string,
    dateFilter?: string,
  ): Observable<Pagination<IExpenseAll>> => {
    let params = createFilter(page, size, sort, direction, filter);
    if (dateFilter) {
      params = params.append('date', dateFilter);
    }

    return this.http.get<Pagination<IExpenseAll>>(this.updatePathVariable(roomId, ['pages']), { params });
  };

  getAllExpensesInfo = (roomId: string): Observable<IExpenseInfo> => this.http.get<IExpenseInfo>(
    this.updatePathVariable(roomId, ['info']),
  );

  getExpense = (roomId: string, id: string): Observable<IExpenseAll | undefined> => this.http.get<IExpenseAll>(
    this.updatePathVariable(roomId, [id]),
  );

  createExpense = (roomId: string, expense: IExpense): Observable<IApiResponse> => this.http.post<IApiResponse>(
    this.updatePathVariable(roomId),
    expense,
  );

  deleteExpense = (roomId: string, id: string): Observable<void> => this.http.delete<void>(
    this.updatePathVariable(roomId, [id]),
  );

  updateExpense = (
    id: string, roomId: string, expense: IExpense,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(this.updatePathVariable(roomId, [id]), expense);

  private updatePathVariable(roomId: string, args?: (string | null | undefined)[]): string {
    let url = this.urlV1;
    if (args && args.length) {
      url = `${this.urlV1}/${args.join('/')}`;
    }
    return url.replace('{roomId}', roomId);
  }
}
