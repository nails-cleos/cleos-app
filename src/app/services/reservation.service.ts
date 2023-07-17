import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICustomerReservation, IReservation, IRoomReservation } from '../interfaces/reservation';
import { PAGE_SIZE } from '../interfaces/pagination';
import { IReview } from '../interfaces/review';

@Injectable()
export class ReservationService {

  private url = 'reservations';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getAllPage(page: number, roomId?: string, professionalId?: string, sort?: string, direction?: string,
                    size: number = PAGE_SIZE): Observable<IReservation[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    if (roomId) {
      return this.http.get<IReservation[]>(`${ this.urlV1 }/rooms/${ roomId }/pages`, { params });
    }

    return this.http.get<IReservation[]>(`${ this.urlV1 }/professionals/${ professionalId }/pages`, { params });
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

    return this.http.get<ICustomerReservation>(`${ this.urlV1 }/customer`, { params });
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

    return this.http.get<IReservation[]>(`${ this.urlV1 }/filter`, { params });
  }

  public getAllGroupingByRoom(days: number, date: Date, roomId: string,
                              professionalId?: string): Observable<IReservation> {
    let params = new HttpParams().set('date', date.toISOString().slice(0, 10))
      .append('days', days);
    if (professionalId) {
      params = params.append('professionalId', professionalId);
    }
    return this.http.get<any>(`${ this.urlV1 }/rooms/${ roomId }`, { params });
  }

  public search(roomId: string, days: number, date: Date, professionalId?: string): Observable<IRoomReservation> {
    let params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    params = params.append('days', days);
    if (professionalId) {
      params = params.append('professionalId', professionalId);
    }
    return this.http.get<IRoomReservation>(`${ this.urlV1 }/rooms/${ roomId }`, { params });
  }

  public customerSearch(roomId: string, treatmentId: string, date: Date, professionalId: string,
                        additionalIds?: string[]): Observable<IRoomReservation> {
    let params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    params = params.append('roomId', roomId);
    params = params.append('treatmentId', treatmentId);
    if (additionalIds && additionalIds.length) {
      additionalIds.forEach(id => {
        params = params.append('additionalIds', id);
      });
    }
    params = params.append('professionalId', professionalId);

    return this.http.get<IRoomReservation>(`${ this.urlV1 }/search`, { params });
  }

  public getById(id: string | null, edit?: boolean): Observable<IReservation | undefined> {
    let url = `${ this.urlV1 }/${ id }`;
    if (edit) {
      url += '/edit';
    }
    return this.http.get<IReservation>(url);
  }

  public findHistory(id: string | null): Observable<IReservation | undefined> {
    return this.http.get<IReservation>(`${ this.urlV1 }/${ id }/history`);
  }

  public add(reservation: IReservation): Observable<IReservation> {
    return this.http.post<IReservation>(this.urlV1, reservation);
  }

  public delete(id: string | null): Observable<IReservation> {
    return this.http.delete<IReservation>(`${ this.urlV1 }/${ id }`);
  }

  public update(reservation: IReservation): Observable<IReservation> {
    return this.http.patch<IReservation>(`${ this.urlV1 }/${ reservation.id }`, reservation);
  }

  public changeState(reservationId: string, event: string, extras?: any): Observable<IReservation> {
    return this.http.post<IReservation>(`${ this.urlV1 }/${ reservationId }/${ event }`, extras);
  }

  public changeCustomer(reservationId: string, customerId: string): Observable<void> {
    return this.http.patch<void>(`${ this.urlV1 }/${ reservationId }/customers/${ customerId }`, null);
  }

  public changeColor(reservationId: string, colorId: string): Observable<void> {
    return this.http.patch<void>(`${ this.urlV1 }/${ reservationId }/colors/${ colorId }`, null);
  }

  public getUpcomingReservation(): Observable<ICustomerReservation> {
    return this.http.get<ICustomerReservation>(`${ this.urlV1 }/upcoming`);
  }

  public paymentComplete(reservationId: string): Observable<IReservation> {
    return this.http.post<IReservation>(`${ this.urlV1 }/${ reservationId }/payment/complete`, null);
  }

  public addReview(review: IReview): Observable<IReview> {
    return this.http.post<IReview>(`${ this.urlV1 }/${ review.reservationId }/reviews`, review);
  }

  public addNote(id: string, note: string): Observable<IReservation> {
    return this.http.patch<IReservation>(`${ this.urlV1 }/${ id }/notes`, note);
  }

  public addDiscount(id: string, discountId: string): Observable<IReservation> {
    return this.http.patch<IReservation>(`${ this.urlV1 }/${ id }/discounts/${ discountId }`, null);
  }
}
