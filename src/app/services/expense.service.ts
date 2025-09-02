import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IExpense, IExpenseInfo } from '../interfaces/expense';
import { createFilter } from '../util/service-helper';

@Injectable()
export class ExpenseService {

  private urlV1 = 'v1/rooms/{roomId}/expenses';

  private http: HttpClient = inject(HttpClient);

  public getExpensesPage = (roomId: string, sort: string, direction: string, page: number, size: number = PAGE_SIZE,
    filter?: string, dateFilter?: string): Observable<IExpense[]> => {
    let params = createFilter(page, size, sort, direction, filter);
    if (dateFilter) {
      params = params.append('date', dateFilter);
    }

    return this.http.get<IExpense[]>(this.updatePathVariable(roomId, ['pages']), { params });
  };

  getAllExpensesInfo = (roomId: string): Observable<IExpenseInfo> => this.http.get<IExpenseInfo>(
    this.updatePathVariable(roomId, ['info']),
  );

  findExpenseById = (roomId: string, id: string): Observable<IExpense | undefined> => this.http.get<IExpense>(
    this.updatePathVariable(roomId, [id]),
  );

  createExpense = (roomId: string, expense: IExpense): Observable<IExpense> => this.http.post<IExpense>(
    this.updatePathVariable(roomId),
    expense,
  );

  deleteExpenseById = (roomId: string, id: string): Observable<IExpense> => this.http.delete<IExpense>(
    this.updatePathVariable(roomId, [id]),
  );

  updateExpenseById = (roomId: string, expense: IExpense): Observable<IExpense> => this.http.patch<IExpense>(
    this.updatePathVariable(roomId, [expense.id]),
    expense,
  );

  private updatePathVariable(roomId: string, args?: (string | null | undefined)[]): string {
    let url = this.urlV1;
    if (args && args.length) {
      url = `${ this.urlV1 }/${ args.join('/') }`;
    }
    return url.replace('{roomId}', roomId);
  }
}
