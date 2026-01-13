import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toUrl } from '../util/helper';
import { paginated, Pagination } from '../interfaces/pagination';
import { SortDirection } from '@angular/material/sort';
import { createFilter } from '../util/service-helper';
import { IStatement } from '../interfaces/statement';

@Injectable({
  providedIn: 'root',
})
export class StatementService {

  private url = 'statements';
  private urlV1 = `v1/${this.url}`;
  private officeUrl = 'offices';

  private http: HttpClient = inject(HttpClient);

  getStatementsPage = (
    officeId: string,
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IStatement>> => this.http.get<Pagination<IStatement>>(
    toUrl(this.urlV1, this.officeUrl, officeId),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  view = (
    id: string,
    driveToken?: string,
  ): Observable<Blob> => {
    let headers = new HttpHeaders({
      Accept: 'application/octet-stream',
    });
    if (driveToken) {
      headers = headers.set('X-Google-Drive-Token', driveToken);
    }
    return this.http.get(toUrl(this.urlV1, id), { headers, responseType: 'blob' });
  };

  uploadStatement = (
    officeId: string,
    blob: Blob,
    fileName: string,
    driveToken?: string,
  ): Observable<void> => {
    const formData = new FormData();
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });
    formData.append('file', file, file.name);

    let headers = new HttpHeaders().set('Upload', 'true');
    if (driveToken) {
      headers = headers.set('X-Google-Drive-Token', driveToken);
    }
    return this.http.post<void>(toUrl(this.urlV1, this.officeUrl, officeId), formData, { headers });
  };
}
