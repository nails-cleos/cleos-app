import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IPayment } from '../interfaces/payment';

@Injectable()
export class PaymentService {

  url = 'payments';

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

    return this.http.get<IPayment[]>(`${this.url}/pages`, {params});
  }

  public getById(id: string | null): Observable<IPayment | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IPayment>(url);
  }

  public add(mlPaymentId: string, reservationId: string, preferenceId: string, status: string): Observable<IPayment> {
    return this.http.post<IPayment>(`reservations/${reservationId}/${this.url}/${status}`,
      {preferenceId, mlPaymentId});
  }

  public recreate(id: string): Observable<IPayment> {
    return this.http.patch<IPayment>(`${this.url}/${id}`, null);
  }

  public findByReservationId(reservationId: string): Observable<IPayment[]> {
    return this.http.get<IPayment[]>(`reservations/${reservationId}/${this.url}`);
  }

  public notify(id: string, reservationId: string, preferenceId: string): Observable<IPayment> {
    return this.http.patch<IPayment>(`reservations/${reservationId}/${this.url}/${id}`, {preferenceId});
  }
}
