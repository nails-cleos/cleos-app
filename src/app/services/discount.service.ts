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

  getDiscountsPage = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
  ): Observable<IDiscount[]> => this.http.get<IDiscount[]>(
    toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) },
  );

  getMyDiscountsPage = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
  ): Observable<IDiscount[]> => this.http.get<IUserDiscount[]>(
    toUrl(this.urlV1, 'me'),
    { params: createFilter(page, size, sort, direction) },
  );

  getMyReferrals = (): Observable<IUserDiscount[]> => this.http.get<IUserDiscount[]>(
    toUrl(this.urlV1, 'me', 'referrals'),
  );

  findDiscountById = (id: string): Observable<IDiscount | undefined> => this.http.get<IDiscount>(toUrl(this.urlV1, id));

  createDiscount = (discount: IDiscount): Observable<IDiscount> => this.http.post<IDiscount>(this.urlV1, discount);

  sendDiscountToCustomers = (
    id: string,
    customersDiscount: string[],
  ): Observable<IDiscount> => this.http.post<IDiscount>(
    toUrl(this.urlV1, id, 'customers'),
    customersDiscount,
  );

  deleteDiscountById = (id: string): Observable<IDiscount> => this.http.delete<IDiscount>(toUrl(this.urlV1, id));

  updateDiscountById = (discount: IDiscount): Observable<IDiscount> => this.http.patch<IDiscount>(
    toUrl(this.urlV1, discount.id!),
    discount,
  );

  findUserDiscountByCustomerId = (customerId: string): Observable<IUserDiscount[]> => this.http.get<IUserDiscount[]>(
    toUrl(this.urlV1, 'customers', customerId),
  );
}
