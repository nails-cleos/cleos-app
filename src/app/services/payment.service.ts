import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IPayment, IPaymentStatus, PaymentType } from '../interfaces/payment';
import { IBank } from "../interfaces/bank";

@Injectable()
export class PaymentService {

  private url = 'payments';
  private urlV1 = `v1/${ this.url }`;
  private reservationUrl = 'reservations';
  private reservationUrlV1 = `v1/${ this.reservationUrl }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IPayment[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IPayment[]>(`${ this.urlV1 }/pages`, { params });
  }

  public getById(id: string | null): Observable<IPayment | undefined> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.get<IPayment>(url);
  }

  public add(reservationId: string, status: string, paymentStatus: IPaymentStatus): Observable<IPayment> {
    return this.http.post<IPayment>(`${ this.reservationUrlV1 }/${ reservationId }/${ this.url }/${ status }`, paymentStatus);
  }

  public create(reservationId: string, type: string, percentage: string): Observable<IPayment> {
    const params = new HttpParams().set('type', type).set('percentage', percentage);
    return this.http.get<IPayment>(`${ this.urlV1 }/reservations/${ reservationId }`, { params });
  }

  public recreate(id: string, paymentType: string): Observable<IPayment> {
    return this.http.patch<IPayment>(`${ this.urlV1 }/${ id }/types/${ paymentType }`, null);
  }

  public findByReservationId(reservationId: string): Observable<IPayment[]> {
    return this.http.get<IPayment[]>(`${ this.reservationUrlV1 }/${ reservationId }/${ this.url }`);
  }

  public notify(id: string, reservationId: string, preferenceId: string, paymentType: string): Observable<IPayment> {
    return this.http.patch<IPayment>(`${ this.reservationUrlV1 }/${ reservationId }/${ this.url }/${ id }`, {
      preferenceId,
      paymentType
    });
  }

  public getBankList(type: PaymentType): Observable<IBank[]> {
    return this.http.get<IBank[]>(`${ this.urlV1 }/types/${ type }/banks`)
  }
}
