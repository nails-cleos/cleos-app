import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';

@Injectable()
export class CatalogueService {

  url = 'catalogues';

  constructor(private http: HttpClient) {
  }

  public getAll(): Observable<ICatalogue[]> {
    return this.http.get<ICatalogue[]>(this.url);
  }

  public getAllCatalogs(): Observable<ICatalogue[]> {
    const params = new HttpParams().set('catalog', String(true));
    return this.http.get<ICatalogue[]>(this.url, {params});
  }

  public getAllHome(): Observable<ICatalogue[]> {
    const params = new HttpParams().set('home', String(true));
    return this.http.get<ICatalogue[]>(this.url, {params});
  }

  public getById(id: string | null): Observable<ICatalogue | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<ICatalogue>(url);
  }

  public add(catalogue: any, file: any): Observable<ICatalogue> {
    const formData = new FormData();
    formData.append('file', file);
    const blob = new Blob([JSON.stringify(catalogue)], {type: 'application/json'});
    formData.append('catalogue', blob);
    return this.http.post<ICatalogue>(this.url, formData);
  }

  public delete(id: string | null): Observable<ICatalogue> {
    const url = `${this.url}/${id}`;
    return this.http.delete<ICatalogue>(url);
  }

  public update(catalogue: ICatalogue, file: any): Observable<ICatalogue> {
    const url = `${this.url}/${catalogue.id}`;
    const formData = new FormData();
    formData.append('file', file);
    const blob = new Blob([JSON.stringify(catalogue)], {type: 'application/json'});
    formData.append('catalogue', blob);
    return this.http.patch<ICatalogue>(url, formData);
  }

  updateAll(catalogues: ICatalogueAll[]): Observable<ICatalogueAll[]> {
    let data: ICatalogue[] = [];
    catalogues.map((value, index) => {
      const catalogue = {
        id: value.id,
        order: index
      } as ICatalogue;
      data = [...data, catalogue];
    });

    return this.http.put<ICatalogueAll[]>(`${this.url}/order`, data);
  }
}
