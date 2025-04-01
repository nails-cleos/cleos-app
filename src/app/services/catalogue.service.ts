import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';
import { dataURLToBlob } from '../util/file';
import { toUrl } from '../util/helper';

@Injectable()
export class CatalogueService {

  private url = 'catalogues';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAll = (): Observable<ICatalogue[]> => this.http.get<ICatalogue[]>(this.urlV1);

  getAllCatalogs = (): Observable<ICatalogue[]> => this.getCatalogue('catalog');

  getAllHome = (): Observable<ICatalogue[]> => this.getCatalogue('home');

  getById = (id: string): Observable<ICatalogue | undefined> => this.http.get<ICatalogue>(toUrl(this.urlV1, id));

  add = (catalogue: any, resizedImageDataUrl: string): Observable<ICatalogue> => {
    const fileBlob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', fileBlob, 'resized-image.jpg');
    const blob = new Blob([JSON.stringify(catalogue)], { type: 'application/json' });
    formData.append('catalogue', blob);

    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.post<ICatalogue>(this.urlV1, formData, { headers });
  };

  delete = (id: string): Observable<ICatalogue> => this.http.delete<ICatalogue>(toUrl(this.urlV1, id));

  update = (catalogue: ICatalogue, resizedImageDataUrl: string): Observable<ICatalogue> => {
    const url = `${ this.urlV1 }/${ catalogue.id }`;
    const fileBlob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', fileBlob, 'resized-image.jpg');

    const blob = new Blob([JSON.stringify(catalogue)], { type: 'application/json' });
    formData.append('catalogue', blob);
    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.patch<ICatalogue>(url, formData, { headers });
  };

  updateAll = (catalogues: ICatalogueAll[]): Observable<ICatalogueAll[]> => {
    let data: ICatalogue[] = [];
    catalogues.map((value, index) => {
      const catalogue = {
        id: value.id,
        order: index
      } as ICatalogue;
      data = [...data, catalogue];
    });

    return this.http.put<ICatalogueAll[]>(`${ this.urlV1 }/order`, data);
  };

  private getCatalogue = (key: string) => this.http.get<ICatalogue[]>(
    this.urlV1,
    { params: new HttpParams().set(key, String(true)) }
  );
}
