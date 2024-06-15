import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';
import { dataURLToBlob } from '../util/file';

@Injectable()
export class CatalogueService {

  private url = 'catalogues';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(): Observable<ICatalogue[]> {
    return this.http.get<ICatalogue[]>(this.urlV1);
  }

  public getAllCatalogs(): Observable<ICatalogue[]> {
    const params = new HttpParams().set('catalog', String(true));
    return this.http.get<ICatalogue[]>(this.urlV1, {params});
  }

  public getAllHome(): Observable<ICatalogue[]> {
    const params = new HttpParams().set('home', String(true));
    return this.http.get<ICatalogue[]>(this.urlV1, {params});
  }

  public getById(id: string | null): Observable<ICatalogue | undefined> {
    const url = `${this.urlV1}/${id}`;
    return this.http.get<ICatalogue>(url);
  }

  public add(catalogue: any, resizedImageDataUrl: string): Observable<ICatalogue> {
    const fileBlob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', fileBlob, 'resized-image.jpg');
    const blob = new Blob([JSON.stringify(catalogue)], {type: 'application/json'});
    formData.append('catalogue', blob);

    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.post<ICatalogue>(this.urlV1, formData, {headers});
  }

  public delete(id: string | null): Observable<ICatalogue> {
    const url = `${this.urlV1}/${id}`;
    return this.http.delete<ICatalogue>(url);
  }

  public update(catalogue: ICatalogue, resizedImageDataUrl: string): Observable<ICatalogue> {
    const url = `${this.urlV1}/${catalogue.id}`;
    const fileBlob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', fileBlob, 'resized-image.jpg');

    const blob = new Blob([JSON.stringify(catalogue)], {type: 'application/json'});
    formData.append('catalogue', blob);
    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.patch<ICatalogue>(url, formData, {headers});
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

    return this.http.put<ICatalogueAll[]>(`${this.urlV1}/order`, data);
  }
}
