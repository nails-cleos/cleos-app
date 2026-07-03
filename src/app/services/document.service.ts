import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toUrl } from '../util/helper';
import { paginated, Pagination } from '../interfaces/pagination';
import { SortDirection } from '@angular/material/sort';
import { createFilter } from '../util/service-helper';
import { IDocument } from '../document/document';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {

  private url = 'documents';
  private urlV1 = `v1/${this.url}`;
  private officeUrl = 'offices';

  private http: HttpClient = inject(HttpClient);

  getDocumentsPage = (
    officeId: string,
    date: string,
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IDocument>> => {
    let params = createFilter(page, size, sort, direction);
    params = params.append('date', date);
    return this.http.get<Pagination<IDocument>>(
      toUrl(this.urlV1, this.officeUrl, officeId, 'pages'), { ...paginated(), params },
    );
  };

  view = (
    id: string,
  ): Observable<Blob> => {
    const headers = new HttpHeaders({ Accept: 'application/octet-stream' });
    return this.http.get(toUrl(this.urlV1, id), { headers, responseType: 'blob' });
  };

  documentDownloadZip = (
    officeId: string,
    date: string,
  ): Observable<Blob> => {
    const headers = new HttpHeaders({ Accept: 'application/zip' });
    const params = new HttpParams().set('date', date);
    return this.http.get(toUrl(this.urlV1, this.officeUrl, officeId), { params, headers, responseType: 'blob' });
  };
}
