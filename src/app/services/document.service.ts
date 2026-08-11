import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toUrl } from '../util/helper';
import {
  paginated,
  Pagination,
  skipLoadingOverlay,
} from '../interfaces/pagination';
import { SortDirection } from '@angular/material/sort';
import { createFilter } from '../util/service-helper';
import { DocumentTypeEnum, IDocument } from '../document/document';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private url = 'documents';
  private urlV1 = `v1/${this.url}`;
  private officeUrl = 'offices';
  private statementUrl = 'statements';

  private http: HttpClient = inject(HttpClient);

  uploadStatement = (
    officeId: string,
    blob: Blob,
    fileName: string,
    id?: string,
  ): Observable<void> => {
    const formData = new FormData();
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });

    formData.append('file', file, file.name);

    const headers = new HttpHeaders().set('Upload', 'true');

    const url = toUrl(
      this.urlV1,
      this.officeUrl,
      officeId,
      this.statementUrl,
      id,
    );

    return id
      ? this.http.patch<void>(url, formData, { headers })
      : this.http.post<void>(url, formData, { headers });
  };

  getDocumentsPage = (
    officeId: string,
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
    date?: string,
    types?: DocumentTypeEnum[],
  ): Observable<Pagination<IDocument>> => {
    let params = createFilter(page, size, sort, direction);
    if (date) {
      params = params.append('date', date);
    }
    if (types && types.length) {
      types.forEach((type) => {
        params = params.append('types', type);
      });
    }
    return this.http.get<Pagination<IDocument>>(
      toUrl(this.urlV1, this.officeUrl, officeId, 'pages'),
      { ...paginated(), params },
    );
  };

  getDocument = (id: string): Observable<IDocument | undefined> =>
    this.http.get<IDocument>(toUrl(this.urlV1, id), {
      ...skipLoadingOverlay(),
    });

  view = (id: string): Observable<Blob> => {
    const headers = new HttpHeaders({ Accept: 'application/octet-stream' });
    return this.http.get(toUrl(this.urlV1, id, 'file'), {
      headers,
      responseType: 'blob',
    });
  };

  deleteDocument = (id: string): Observable<void> =>
    this.http.delete<void>(toUrl(this.urlV1, id));

  documentDownloadZip = (officeId: string, date: string): Observable<Blob> => {
    const headers = new HttpHeaders({ Accept: 'application/zip' });
    const params = new HttpParams().set('date', date);
    return this.http.get(toUrl(this.urlV1, this.officeUrl, officeId), {
      params,
      headers,
      responseType: 'blob',
    });
  };
}
