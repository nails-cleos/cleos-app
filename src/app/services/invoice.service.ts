import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOfficeAll } from '../interfaces/office';
import { IInvoice } from '../interfaces/invoice';
import { toUrl } from '../util/helper';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  private url = 'invoices';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  getAllMyOffices = (): Observable<IOfficeAll[]> => this.http.get<IOfficeAll[]>(toUrl(this.urlV1, 'offices'));

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

    return this.http.get<IInvoice[]>(toUrl(this.urlV1, 'offices', officeId), { params });
  };

  uploadInvoices = (
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
    return this.http.post<void>(toUrl(this.urlV1, 'offices', officeId), formData, { headers });
  };
}
