import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOffice } from '../interfaces/office';
import { IReservation } from '../interfaces/reservation';
import { IInvoice } from '../interfaces/invoice';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private url = 'invoices';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAllMeOffice(): Observable<IOffice[]> {
    return this.http.get<IOffice[]>(`${ this.urlV1 }/offices`);
  }

  public findInvoiceReservation(officeId: string, start: string, end: string, types?: string[]): Observable<IReservation[]> {
    let params = new HttpParams().set('start', start).set('end', end);
    if (types && types.length) {
      types.forEach(type => {
        params = params.append('types', type);
      });
    }

    return this.http.get<IInvoice[]>(`${ this.urlV1 }/offices/${ officeId }`, { params });
  }
}
