import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IPayment, IPaymentStatus } from '../interfaces/payment';
import { IReservationPayment } from '../interfaces/reservation';
import { createFilter } from '../util/service-helper';
import { toUrl } from "../util/helper";

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

  getAll = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE
  ): Observable<IPayment[]> => this.http.get<IPayment[]>(
    toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) }
  );

  getById = (id: string): Observable<IPayment | undefined> => this.http.get<IPayment>(toUrl(this.urlV1, id));

  paymentOptions = (): Observable<IPayment | undefined> => this.http.get<IPayment>(this.urlV1);

  add = (
    id: string,
    path: 'reservation' | 'transaction',
    status: string,
    paymentStatus: IPaymentStatus
  ): Observable<IPayment> => this.http.post<IPayment>(toUrl(this.getKey(path), id, this.url, status), paymentStatus);

  create = (reservationId: string, payment: IReservationPayment): Observable<IPayment> => this.http.post<IPayment>(
    toUrl(this.urlV1, 'reservations', reservationId),
    payment
  );

  update = (payment: IReservationPayment[]): Observable<void> => this.http.patch<void>(this.urlV1, payment);

  updateLink = (id: string, payment: IReservationPayment): Observable<IPayment> => this.http.patch<IPayment>(
    toUrl(this.urlV1, id),
    payment
  );

  recreate = (id: string, paymentType: string): Observable<IPayment> => this.http.patch<IPayment>(
    toUrl(this.urlV1, id, 'types', paymentType),
    null
  );

  findByResourceId = (
    id: string,
    path: 'reservation' | 'transaction'
  ): Observable<IPayment[]> => this.http.get<IPayment[]>(toUrl(this.getKey(path), id, this.url));

  public notify = (
    id: string,
    path: 'reservation' | 'transaction',
    resourceId: string,
    preferenceId: string,
    paymentType: string
  ): Observable<IPayment> => this.http.patch<IPayment>(
    toUrl(this.getKey(path), resourceId, this.url, id),
    { preferenceId, paymentType }
  );

  private getKey = (path: 'reservation' | 'transaction'): string => {
    switch (path) {
      case 'reservation':
        return this.reservationUrlV1;
      case 'transaction':
        return this.transactionUrlV1;
    }
  }
}
