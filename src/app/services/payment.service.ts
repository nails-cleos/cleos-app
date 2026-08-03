import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IPay,
  IPayment,
  IPaymentAll,
  IPaymentOption,
  IPaymentRequest,
  IPaymentResource,
  IPaymentStatus,
} from '../interfaces/payment';
import { IReservationPayment } from '../reservation/reservation';
import { toUrl } from '../util/helper';
import { IApiResponse } from '../interfaces/common';
import { skipLoadingOverlay } from '../interfaces/pagination';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private url = 'payments';
  private urlV1 = `v1/${ this.url }`;
  private reservationUrl = 'reservations';
  private transactionUrl = 'accounts/transactions';
  private reservationUrlV1 = `v1/${ this.reservationUrl }`;
  private transactionUrlV1 = `v1/${ this.transactionUrl }`;

  private http: HttpClient = inject(HttpClient);

  getPayment = (id: string): Observable<IPaymentAll | undefined> => this.http.get<IPaymentAll>(toUrl(this.urlV1, id));

  getPaymentOptions = (): Observable<IPaymentOption[]> => this.http.get<IPaymentOption[]>(toUrl(this.urlV1, 'options'),
    { ...skipLoadingOverlay() });

  add = (
    id: string,
    path: 'reservation' | 'transaction',
    status: string,
    paymentStatus: IPaymentStatus,
  ): Observable<IPay> => this.http.post<IPay>(toUrl(this.getKey(path), id, this.url, status), paymentStatus);

  createPaymentLinkByReservationId = (
    reservationId: string,
    payment: IReservationPayment,
  ): Observable<IPayment> => this.http.post<IPayment>(
    toUrl(this.urlV1, 'reservations', reservationId),
    payment,
  );

  adjustPayments = (payment: IPaymentRequest[]): Observable<void> => this.http.patch<void>(this.urlV1, payment);

  updatePayment = (id: string, payment: IReservationPayment): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id),
    payment,
  );

  recreate = (id: string, paymentType: string): Observable<IPayment> => this.http.patch<IPayment>(
    toUrl(this.urlV1, id, 'types', paymentType),
    null,
  );

  getPaymentByResourceId = (
    id: string,
    path: 'reservation' | 'transaction',
  ): Observable<IPaymentResource> => this.http.get<IPaymentResource>(
    toUrl(this.getKey(path), id, this.url),
    skipLoadingOverlay(),
  );

  public notifyPayment = (
    id: string,
    path: 'reservation' | 'transaction',
    resourceId: string,
    preferenceId: string,
    paymentType: string,
  ): Observable<IPay> => this.http.patch<IPay>(
    toUrl(this.getKey(path), resourceId, this.url, id),
    { preferenceId, paymentType },
  );

  private getKey = (path: 'reservation' | 'transaction'): string => {
    let url = '';
    switch (path) {
      case 'reservation':
        url = this.reservationUrlV1;
        break;
      case 'transaction':
        url = this.transactionUrlV1;
        break;
    }
    return url;
  };
}
