import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICustomerReservation, IReservation, IRoomReservation } from '../interfaces/reservation';
import { getNow } from '../util/dates';
import { PAGE_SIZE } from '../interfaces/pagination';
import { IReview } from '../interfaces/review';

@Injectable()
export class ReservationService {

  url = 'reservations';

  constructor(private http: HttpClient) {
  }

  public getAllPage(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IReservation[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IReservation[]>(`${this.url}/pages`, {params});
  }

  public getCustomerReservations(sort: string, direction: string, page: number,
                                 size: number = PAGE_SIZE): Observable<ICustomerReservation> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<ICustomerReservation>(`${this.url}/customer`, {params});
  }

  public getAllFilterReservationsPage(sort: string, direction: string, page: number, size: number = PAGE_SIZE,
                                      userId?: string, states?: string[]): Observable<IReservation[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }
    if (userId) {
      params = params.append('userId', userId);
    }
    if (states && states.length) {
      states.forEach(state => {
        params = params.append('states', state);
      });
    }

    return this.http.get<IReservation[]>(`${this.url}/filter`, {params});
  }

  public getAllGroupingByRoom(): Observable<IReservation[]> {
    const params = new HttpParams().set('date', getNow().toISOString().slice(0, 10));
    return this.http.get<any>(`${this.url}/rooms`, {params});
  }

  public search(roomId: string, date: Date): Observable<IRoomReservation> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IRoomReservation>(`${this.url}/rooms/${roomId}`, {params});
  }

  public customerSearch(roomId: string, productId: string, date: Date, additionalIds?: string[]): Observable<IRoomReservation> {
    let params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    params = params.append('roomId', roomId);
    params = params.append('productId', productId);
    if (additionalIds && additionalIds.length) {
      additionalIds.forEach(id => {
        params = params.append('additionalIds', id);
      });
    }

    return this.http.get<IRoomReservation>(`${this.url}/search`, {params});
  }

  public getById(id: string | null): Observable<IReservation | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IReservation>(url);
  }

  public add(reservation: IReservation): Observable<IReservation> {
    return this.http.post<IReservation>(this.url, reservation);
  }

  public delete(id: string | null): Observable<IReservation> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IReservation>(url);
  }

  public update(reservation: IReservation): Observable<IReservation> {
    const url = `${this.url}/${reservation.id}`;
    return this.http.patch<IReservation>(url, reservation);
  }

  public changeState(reservationId: string, event: string, extras?: any): Observable<IReservation> {
    return this.http.post<IReservation>(`${this.url}/${reservationId}/${event}`, extras);
  }

  public getUpcomingReservation(): Observable<ICustomerReservation> {
    return this.http.get<ICustomerReservation>(`${this.url}/upcoming`);
  }

  public paymentComplete(reservationId: string): Observable<IReservation> {
    return this.http.post<IReservation>(`${this.url}/${reservationId}/payment/complete`, null);
  }

  public addReview(review: IReview): Observable<IReview> {
    return this.http.post<IReview>(`${this.url}/${review.reservationId}/reviews`, review);
  }
}
