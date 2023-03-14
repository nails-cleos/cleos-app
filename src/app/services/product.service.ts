import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProductAll, IProductDiscountDTO, IProductGroup } from '../interfaces/product';
import { PAGE_SIZE } from '../interfaces/pagination';

@Injectable()
export class ProductService {

  private url = 'products';
  private urlV1 = `v1/${this.url}`;

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

    return this.http.get<IProductGroup[]>(`${this.urlV1}/pages`, {params});
  }

  public getAllProducts(roomId: string, customerId?: string): Observable<IProductDiscountDTO[]> {
    let params = new HttpParams().set('roomId', roomId);
    if (customerId) {
      params = params.append('customerId', customerId);
    }
    return this.http.get<IProductDiscountDTO[]>(this.urlV1, {params});
  }

  public getProductList(): Observable<IProductGroup[]> {
    return this.http.get<IProductGroup[]>(`${this.urlV1}/list`);
  }

  public getById(id: string | null): Observable<IProductGroup | undefined> {
    const url = `${this.urlV1}/${id}`;
    return this.http.get<IProductGroup>(url);
  }

  public add(product: IProductGroup): Observable<IProductGroup> {
    return this.http.post<IProductGroup>(this.urlV1, product);
  }

  public delete(id: string | null): Observable<IProductGroup> {
    const url = `${this.urlV1}/${id}`;
    return this.http.delete<IProductGroup>(url);
  }

  public update(product: IProductGroup): Observable<IProductGroup> {
    const url = `${this.urlV1}/${product.id}`;
    return this.http.patch<IProductGroup>(url, product);
  }

  public getHistory(id: string, productId: string): Observable<IProductAll[] | undefined> {
    const url = `${this.urlV1}/${id}/products/${productId}/histories`;
    return this.http.get<IProductAll[]>(url);
  }
}
