import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDiscount, IUserDiscount } from '../interfaces/discount';
import { PAGE_SIZE } from '../interfaces/pagination';
import { createFilter } from '../util/service-helper';

@Injectable()
export class DiscountService {

  private url = 'discounts';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, path: string, size: number = PAGE_SIZE): Observable<IDiscount[]> {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<IDiscount[]>(`${ this.urlV1 }/${ path }`, { params });
  }

  public getReferrals(): Observable<IUserDiscount[]> {
    return this.http.get<IUserDiscount[]>(`${ this.urlV1 }/me/referrals`);
  }

  public getById(id: string | null): Observable<IDiscount | undefined> {
    return this.http.get<IDiscount>(`${ this.urlV1 }/${ id }`);
  }

  public add(discount: IDiscount): Observable<IDiscount> {
    return this.http.post<IDiscount>(this.urlV1, discount);
  }

  public send(id: string, customersDiscount: string[]): Observable<IDiscount> {
    return this.http.post<IDiscount>(`${ this.urlV1 }/${ id }/customers`, customersDiscount);
  }

  public delete(id: string | null): Observable<IDiscount> {
    return this.http.delete<IDiscount>(`${ this.urlV1 }/${ id }`);
  }

  public update(discount: IDiscount): Observable<IDiscount> {
    return this.http.patch<IDiscount>(`${ this.urlV1 }/${ discount.id }`, discount);
  }

  public findByCustomerId(customerId: string): Observable<IUserDiscount[]> {
    return this.http.get<IUserDiscount[]>(`${ this.urlV1 }/customers/${ customerId }`);
  }
}
