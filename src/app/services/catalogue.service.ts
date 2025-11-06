import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';
import { dataURLToBlob } from '../util/file';
import { toUrl } from '../util/helper';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class CatalogueService {

  private url = 'catalogues';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAllCatalogues = (): Observable<ICatalogue[]> => this.http.get<ICatalogue[]>(this.urlV1);

  getAllCatalogs = (): Observable<ICatalogue[]> => this.findCatalogue('catalog');

  getAllHome = (): Observable<ICatalogue[]> => this.findCatalogue('home');

  getCatalogue = (id: string): Observable<ICatalogue | undefined> => this.http.get<ICatalogue>(
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

  updateCatalogue = (catalogue: ICatalogue, resizedImageDataUrl: string): Observable<IApiResponse> => {
    const url = `${ this.urlV1 }/${ catalogue.id }`;
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

    return this.http.put<void>(`${ this.urlV1 }/order`, data);
  };

  private findCatalogue = (key: string) => this.http.get<ICatalogue[]>(
    this.urlV1,
    { params: new HttpParams().set(key, String(true)) },
  );
}
