import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICustomerReservation, IReservation, IRoomReservation } from '../interfaces/reservation';
import { PAGE_SIZE } from '../interfaces/pagination';
import { IReview } from '../interfaces/review';
import { createFilter } from '../util/service-helper';
import { toUrl } from "../util/helper";

@Injectable()
export class ReservationService {

  private url = 'reservations';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAllPage = (
    page: number,
    all?: boolean,
    roomId?: string,
    professionalId?: string,
    sort?: string,
    direction?: string,
    size: number = PAGE_SIZE
  ): Observable<IReservation[]> => {
    const params = createFilter(page, size, sort, direction);

    let baseUrl = this.urlV1;
    if (!all) {
      if (roomId) {
        baseUrl += `/rooms/${ roomId }`;
      } else {
        baseUrl += `/professionals/${ professionalId }`;
      }
    }

    return this.http.get<IReservation[]>(`${ baseUrl }/pages`, { params });
  }

  getCustomerReservations = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE
  ): Observable<ICustomerReservation> => {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<ICustomerReservation>(toUrl(this.urlV1, 'customer'), { params });
  }

  getAllFilterReservationsPage = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
    userId?: string,
    states?: string[]
  ): Observable<IReservation[]> => {
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

    return this.http.get<IReservation[]>(toUrl(this.urlV1, 'filter'), { params });
  }

  getAllGroupingByRoom = (
    days: number,
    date: Date,
    roomId: string,
    professionalId?: string
  ): Observable<IRoomReservation[]> => {
    let params = new HttpParams().set('dates', date.toISOString().slice(0, 10)).append('days', days);
    if (professionalId) {
      params = params.append('professionalId', professionalId);
    }
    return this.http.get<IRoomReservation[]>(toUrl(this.urlV1, 'rooms', roomId), { params });
  }

  search = (
    roomId: string,
    days: number,
    dates: Date[],
    professionalId?: string
  ): Observable<IRoomReservation[]> => {
    let params = new HttpParams().set('days', days);
    dates.forEach(date => {
      params = params.append('dates', date.toISOString().slice(0, 10));
    });

    if (professionalId) {
      params = params.append('professionalId', professionalId);
    }
    return this.http.get<IRoomReservation[]>(toUrl(this.urlV1, 'rooms', roomId), { params });
  }

  customerSearch = (
    roomId: string,
    treatmentId: string,
    date: Date,
    professionalId: string,
    additionalIds?: string[]
  ): Observable<IRoomReservation> => {
    let params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    params = params.append('roomId', roomId);
    params = params.append('treatmentId', treatmentId);
    if (additionalIds && additionalIds.length) {
      additionalIds.forEach(id => {
        params = params.append('additionalIds', id);
      });
    }
    params = params.append('professionalId', professionalId);

    return this.http.get<IRoomReservation>(toUrl(this.urlV1, 'search'), { params });
  }

  getById = (id: string, edit?: boolean): Observable<IReservation | undefined> => {
    let url = toUrl(this.urlV1, id);
    if (edit) {
      url += '/edit';
    }
    return this.http.get<IReservation>(url);
  }

  findHistory = (id: string): Observable<IReservation | undefined> => this.http.get<IReservation>(
    toUrl(this.urlV1, id, 'history')
  );

  add = (
    reservation: IReservation
  ): Observable<IReservation[]> => this.http.post<IReservation[]>(this.urlV1, reservation);

  delete = (id: string): Observable<IReservation> => this.http.delete<IReservation>(toUrl(this.urlV1, id));

  update = (
    reservation: IReservation
  ): Observable<IReservation> => this.http.patch<IReservation>(toUrl(this.urlV1, reservation.id!), reservation);

  changeState = (
    reservationId: string,
    event: string,
    extras?: any
  ): Observable<IReservation> => this.http.post<IReservation>(toUrl(this.urlV1, reservationId, event), extras);

  changeCustomer = (
    reservationId: string,
    customerId: string
  ): Observable<void> => this.http.patch<void>(toUrl(this.urlV1, reservationId, 'customers', customerId), null);

  changeColor = (
    reservationId: string,
    colorId: string
  ): Observable<void> => this.http.patch<void>(toUrl(this.urlV1, reservationId, 'colors', colorId), null);

  getUpcomingReservation = (): Observable<ICustomerReservation> => this.http.get<ICustomerReservation>(
    toUrl(this.urlV1, 'upcoming')
  );

  paymentComplete = (reservationId: string): Observable<IReservation> => this.http.post<IReservation>(
    toUrl(this.urlV1, reservationId, 'payment', 'complete'),
    null
  );

  addReview = (
    review: IReview
  ): Observable<IReview> => this.http.post<IReview>(toUrl(this.urlV1, review.reservationId!, 'reviews'), review);

  addNote = (
    id: string,
    note?: string,
    customerNote?: string
  ): Observable<IReservation> => this.http.patch<IReservation>(toUrl(this.urlV1, id, 'notes'), { note, customerNote });

  addDiscount = (
    id: string,
    discountId: string
  ): Observable<IReservation> => this.http.patch<IReservation>(toUrl(this.urlV1, id, 'discounts', discountId), null);

  addTimestamp = (
    id: string,
    start: string
  ): Observable<IReservation> => this.http.patch<IReservation>(toUrl(this.urlV1, id, 'timestamp'), start);
}
