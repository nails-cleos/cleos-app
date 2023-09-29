import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IPayment, IPaymentStatus } from '../interfaces/payment';
import { IReservationPayment } from '../interfaces/reservation';

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

  public paymentOptions(): Observable<IPayment | undefined> {
    return this.http.get<IPayment>(this.urlV1);
  }

  public add(reservationId: string, status: string, paymentStatus: IPaymentStatus): Observable<IPayment> {
    return this.http.post<IPayment>(`${ this.reservationUrlV1 }/${ reservationId }/${ this.url }/${ status }`, paymentStatus);
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

  public findByReservationId(reservationId: string): Observable<IPayment[]> {
    return this.http.get<IPayment[]>(`${ this.reservationUrlV1 }/${ reservationId }/${ this.url }`);
  }

  public notify(id: string, reservationId: string, preferenceId: string, paymentType: string): Observable<IPayment> {
    return this.http.patch<IPayment>(`${ this.reservationUrlV1 }/${ reservationId }/${ this.url }/${ id }`, {
      preferenceId,
      paymentType
    });
  }
}
