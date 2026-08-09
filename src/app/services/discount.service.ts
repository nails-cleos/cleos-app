import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IDiscount,
  IDiscountAll,
  IReferral,
  IUserDiscount,
} from '../discount/discount';
import {
  paginated,
  Pagination,
  skipLoadingOverlay,
} from '../interfaces/pagination';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private url = 'discounts';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  getDiscountsPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IDiscountAll>> =>
    this.http.get<Pagination<IDiscountAll>>(toUrl(this.urlV1, 'pages'), {
      ...paginated(),
      params: createFilter(page, size, sort, direction),
    });

  getMyDiscountsPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IUserDiscount>> =>
    this.http.get<Pagination<IUserDiscount>>(toUrl(this.urlV1, 'me'), {
      ...paginated(),
      params: createFilter(page, size, sort, direction),
    });

  getMyReferrals = (): Observable<IReferral[]> =>
    this.http.get<IReferral[]>(toUrl(this.urlV1, 'me', 'referrals'));

  getDiscount = (id: string): Observable<IDiscountAll | undefined> =>
    this.http.get<IDiscountAll>(toUrl(this.urlV1, id), {
      ...skipLoadingOverlay(),
    });

  createDiscount = (discount: IDiscount): Observable<IApiResponse> =>
    this.http.post<IApiResponse>(this.urlV1, discount);

  sendDiscounts = (
    id: string,
    customersDiscount: string[],
  ): Observable<IApiResponse> =>
    this.http.post<IApiResponse>(
      toUrl(this.urlV1, id, 'customers'),
      customersDiscount,
    );

  deleteDiscount = (id: string): Observable<void> =>
    this.http.delete<void>(toUrl(this.urlV1, id));

  updateDiscount = (
    id: string,
    discount: IDiscount,
  ): Observable<IApiResponse> =>
    this.http.patch<IApiResponse>(toUrl(this.urlV1, id), discount);

  getUserDiscountByCustomerId = (
    customerId: string,
  ): Observable<IUserDiscount[]> =>
    this.http.get<IUserDiscount[]>(toUrl(this.urlV1, 'customers', customerId));
}
