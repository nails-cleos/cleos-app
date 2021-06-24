import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDiscount, IUserDiscount } from '../interfaces/discount';
import { PAGE_SIZE } from '../interfaces/pagination';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {

  url = 'discounts';

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, path: string, size: number = PAGE_SIZE): Observable<IDiscount[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IDiscount[]>(`${this.url}/${path}`, {params});
  }

  public getReferrals(): Observable<IUserDiscount[]> {
    return this.http.get<IUserDiscount[]>(`${this.url}/me/referrals`);
  }

  public getById(id: string | null): Observable<IDiscount | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IDiscount>(url);
  }

  public add(discount: IDiscount): Observable<IDiscount> {
    return this.http.post<IDiscount>(this.url, discount);
  }

  public send(id: string, customersDiscount: string[]): Observable<IDiscount> {
    return this.http.post<IDiscount>(`${this.url}/${id}/customers`, customersDiscount);
  }

  public delete(id: string | null): Observable<IDiscount> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IDiscount>(url);
  }

  public update(discount: IDiscount): Observable<IDiscount> {
    const url = `${this.url}/${discount.id}`;
    return this.http.patch<IDiscount>(url, discount);
  }
}
