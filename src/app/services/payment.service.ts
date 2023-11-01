import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IPayment, IPaymentStatus } from '../interfaces/payment';
import { IReservationPayment } from '../interfaces/reservation';
import { createFilter } from '../util/service-helper';

@Injectable()
export class PaymentService {

  private url = 'payments';
  private urlV1 = `v1/${ this.url }`;
  private reservationUrl = 'reservations';
  private transactionUrl = 'accounts/transactions';
  private reservationUrlV1 = `v1/${ this.reservationUrl }`;
  private transactionUrlV1 = `v1/${ this.transactionUrl }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IPayment[]> {
    const params = createFilter(page, size, sort, direction);

    return this.http.get<IPayment[]>(`${ this.urlV1 }/pages`, { params });
  }

  public getById(id: string | null): Observable<IPayment | undefined> {
    const url = `${ this.urlV1 }/${ id }`;
    return this.http.get<IPayment>(url);
  }

  public paymentOptions(): Observable<IPayment | undefined> {
    return this.http.get<IPayment>(this.urlV1);
  }

  public add(id: string, path: 'reservation' | 'transaction', status: string, paymentStatus: IPaymentStatus): Observable<IPayment> {
    const key = this.getKey(path);
    return this.http.post<IPayment>(`${ key }/${ id }/${ this.url }/${ status }`, paymentStatus);
  }

  public create(reservationId: string, payment: IReservationPayment): Observable<IPayment> {
    return this.http.post<IPayment>(`${ this.urlV1 }/reservations/${ reservationId }`, payment);
  }

  public update(payment: IReservationPayment[]): Observable<void> {
    return this.http.patch<void>(this.urlV1, payment);
  }

  public updateLink(id: string, payment: IReservationPayment): Observable<IPayment> {
    return this.http.patch<IPayment>(`${ this.urlV1 }/${ id }`, payment);
  }

  public recreate(id: string, paymentType: string): Observable<IPayment> {
    return this.http.patch<IPayment>(`${ this.urlV1 }/${ id }/types/${ paymentType }`, null);
  }

  public findByResourceId(id: string, path: 'reservation' | 'transaction'): Observable<IPayment[]> {
    const key = this.getKey(path);
    return this.http.get<IPayment[]>(`${ key }/${ id }/${ this.url }`);
  }

  public notify(id: string, path: 'reservation' | 'transaction', resourceId: string, preferenceId: string,
                paymentType: string): Observable<IPayment> {
    const key = this.getKey(path);
    return this.http.patch<IPayment>(`${ key }/${ resourceId }/${ this.url }/${ id }`, {
      preferenceId,
      paymentType
    });
  }

  private getKey(path: 'reservation' | 'transaction'): string {
    switch (path) {
      case 'reservation':
        return this.reservationUrlV1;
      case 'transaction':
        return this.transactionUrlV1;
    }
  }
}
