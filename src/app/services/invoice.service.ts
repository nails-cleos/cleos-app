import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOfficeAll } from '../office/office';
import { IInvoice, IInvoiceData } from '../invoice/invoice';
import { toUrl } from '../util/helper';
import { paginated, Pagination } from '../interfaces/pagination';
import { SortDirection } from '@angular/material/sort';
import { createFilter } from '../util/service-helper';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  private url = 'invoices';
  private urlV1 = `v1/${this.url}`;
  private officeUrl = 'offices';

  private http: HttpClient = inject(HttpClient);

  getAllMyOffices = (): Observable<IOfficeAll[]> => this.http.get<IOfficeAll[]>(toUrl(this.urlV1, this.officeUrl));

  getInvoicesPage = (
    officeId: string,
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IInvoiceData>> => this.http.get<Pagination<IInvoiceData>>(
    toUrl(this.urlV1, this.officeUrl, officeId, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  getOfficeToInvoice = (
    officeId: string,
    start: string,
    end: string,
    types?: string[],
  ): Observable<IInvoice[]> => {
    let params = new HttpParams().set('start', start).set('end', end);
    if (types && types.length) {
      types.forEach(type => {
        params = params.append('types', type);
      });
    }

    return this.http.get<IInvoice[]>(toUrl(this.urlV1, this.officeUrl, officeId), { params });
  };

  uploadInvoices = (
    officeId: string,
    blob: Blob,
    fileName: string,
  ): Observable<void> => {
    const formData = new FormData();
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    });
    formData.append('file', file, file.name);

    const headers = new HttpHeaders().set('Upload', 'true');
    return this.http.post<void>(toUrl(this.urlV1, this.officeUrl, officeId), formData, { headers });
  };
}
