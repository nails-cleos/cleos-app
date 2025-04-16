import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDiscount, IUserDiscount } from '../interfaces/discount';
import { PAGE_SIZE } from '../interfaces/pagination';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';

@Injectable()
export class DiscountService {

  private url = 'discounts';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAll = (
    sort: string,
    direction: string,
    page: number,
    path: string,
    size: number = PAGE_SIZE,
  ): Observable<IDiscount[]> => this.http.get<IDiscount[]>(
    toUrl(this.urlV1, path),
    { params: createFilter(page, size, sort, direction) },
  );

  getReferrals = (): Observable<IUserDiscount[]> => this.http.get<IUserDiscount[]>(
    toUrl(this.urlV1, 'me', 'referrals'),
  );

  getById = (id: string): Observable<IDiscount | undefined> => this.http.get<IDiscount>(toUrl(this.urlV1, id));

  add = (discount: IDiscount): Observable<IDiscount> => this.http.post<IDiscount>(this.urlV1, discount);

  send = (id: string, customersDiscount: string[]): Observable<IDiscount> => this.http.post<IDiscount>(
    toUrl(this.urlV1, id, 'customers'),
    customersDiscount,
  );

  delete = (id: string): Observable<IDiscount> => this.http.delete<IDiscount>(toUrl(this.urlV1, id));

  update = (discount: IDiscount): Observable<IDiscount> => this.http.patch<IDiscount>(
    toUrl(this.urlV1, discount.id!),
    discount,
  );

  findByCustomerId = (customerId: string): Observable<IUserDiscount[]> => this.http.get<IUserDiscount[]>(
    toUrl(this.urlV1, 'customers', customerId),
  );
}
