import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICatalogue, ICatalogueAll } from '../catalogue/catalogue';
import { dataURLToBlob } from '../util/file';
import { toUrl } from '../util/helper';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class CatalogueService {

  private url = 'catalogues';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  getAllCatalogues = (): Observable<ICatalogueAll[]> => this.http.get<ICatalogueAll[]>(this.urlV1);

  getAllCatalogs = (): Observable<ICatalogueAll[]> => this.findCatalogue('catalog');

  getAllHome = (): Observable<ICatalogueAll[]> => this.findCatalogue('home');

  getCatalogue = (id: string): Observable<ICatalogueAll | undefined> => this.http.get<ICatalogueAll>(
    toUrl(this.urlV1, id),
  );

  createCatalogue = (catalogue: ICatalogue, resizedImageDataUrl: string): Observable<IApiResponse> => {
    const fileBlob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', fileBlob, 'resized-image.jpg');
    const blob = new Blob([JSON.stringify(catalogue)], { type: 'application/json' });
    formData.append('catalogue', blob);

    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.post<IApiResponse>(this.urlV1, formData, { headers });
  };

  deleteCatalogue = (id: string): Observable<ICatalogue> => this.http.delete<ICatalogue>(toUrl(this.urlV1, id));

  updateCatalogue = (id: string, catalogue: ICatalogue, resizedImageDataUrl: string): Observable<IApiResponse> => {
    const url = `${this.urlV1}/${id}`;
    const fileBlob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', fileBlob, 'resized-image.jpg');

    const blob = new Blob([JSON.stringify(catalogue)], { type: 'application/json' });
    formData.append('catalogue', blob);
    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.patch<IApiResponse>(url, formData, { headers });
  };

  updateCatalogueOrder = (catalogues: ICatalogueAll[]): Observable<void> => {
    let data: ICatalogue[] = [];
    catalogues.map((value, index) => {
      const catalogue = {
        id: value.id,
        order: index,
      } as ICatalogue;
      data = [...data, catalogue];
    });

    return this.http.put<void>(`${this.urlV1}/orders`, data);
  };

  private findCatalogue = (key: string) => this.http.get<ICatalogueAll[]>(
    this.urlV1,
    { params: new HttpParams().set(key, String(true)) },
  );
}
