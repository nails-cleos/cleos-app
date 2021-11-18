import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProductDiscountDTO, IProductGroup } from '../interfaces/product';
import { PAGE_SIZE } from '../interfaces/pagination';

@Injectable()
export class ProductService {

  url = 'products';

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IProductGroup[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IProductGroup[]>(`${this.url}/pages`, {params});
  }

  public getAllProducts(customerId?: string): Observable<IProductDiscountDTO[]> {
    let params = new HttpParams();
    if (customerId) {
      params = params.append('customerId', customerId);
    }
    return this.http.get<IProductDiscountDTO[]>(this.url, {params});
  }

  public getProductList(): Observable<IProductGroup[]> {
    return this.http.get<IProductGroup[]>(`${this.url}/list`);
  }

  public getById(id: string | null): Observable<IProductGroup | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IProductGroup>(url);
  }

  public add(product: IProductGroup): Observable<IProductGroup> {
    return this.http.post<IProductGroup>(this.url, product);
  }

  public delete(id: string | null): Observable<IProductGroup> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IProductGroup>(url);
  }

  public update(product: IProductGroup): Observable<IProductGroup> {
    const url = `${this.url}/${product.id}`;
    return this.http.patch<IProductGroup>(url, product);
  }
}
