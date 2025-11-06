import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOffice } from '../interfaces/office';
import { IInvoice } from '../interfaces/invoice';
import { toUrl } from '../util/helper';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  private url = 'invoices';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAllMyOffices = (): Observable<IOffice[]> => this.http.get<IOffice[]>(toUrl(this.urlV1, 'offices'));

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
}
