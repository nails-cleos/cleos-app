import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct, PAGE_SIZE } from '../interfaces/product';
import { IUser } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  url = 'products';

  constructor(private http: HttpClient) {
  }

  getAll(sort: string, direction: string, page: number): Observable<IProduct[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(PAGE_SIZE));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IProduct[]>(this.url, {params});
  }

  getById(id: string | null): Observable<IProduct | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IProduct>(url);
  }

  add(product: IProduct): Observable<IProduct> {
    return this.http.post<IProduct>(this.url, product);
  }

  delete(id: string | null): Observable<IProduct> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IProduct>(url);
  }

  update(product: IProduct): Observable<IProduct> {
    const url = `${this.url}/${product.id}`;
    return this.http.patch<IProduct>(url, product);
  }
}
