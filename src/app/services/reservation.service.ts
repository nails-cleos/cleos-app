import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IAvailableDTO,
  ICustomerReservation,
  IReservation,
  IReservationAll,
  IRoomReservation,
  IUpcomingAll,
} from '../reservation/reservation';
import { paginated, Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { IReview } from '../me/reservation/list/review';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class ReservationService {

  private url = 'reservations';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
    all?: boolean,
    roomId?: string,
    professionalId?: string,
  ): Observable<Pagination<IReservationAll>> => {
    const params = createFilter(page, size, sort, direction);

    let baseUrl = this.urlV1;
    if (!all) {
      if (roomId) {
        baseUrl += `/rooms/${ roomId }`;
      } else {
        baseUrl += `/professionals/${ professionalId }`;
      }
    }

    return this.http.get<Pagination<IReservationAll>>(`${ baseUrl }/pages`, { ...paginated(), params });
  };

  getCustomerReservations = (
    sort: string,
    direction: SortDirection,
    page: number,
    size: number,
  ): Observable<ICustomerReservation> => {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<ICustomerReservation>(toUrl(this.urlV1, 'customer'), { ...skipLoadingOverlay(), params });
  };

  getAllFilterReservations = (
    sort: string,
    direction: SortDirection,
    page: number,
    size: number,
    userId?: string,
    states?: string[],
  ): Observable<Pagination<IReservationAll>> => {
    let params = createFilter(page, size, sort, direction);
    if (userId) {
      params = params.append('userId', userId);
    }
    if (states && states.length) {
      states.forEach(state => {
        params = params.append('states', state);
      });
    }
    return this.http.get<Pagination<IReservationAll>>(toUrl(this.urlV1, 'filter'), { ...paginated(), params });
  };

  getAllGroupingByRoom = (
    days: number,
    date: Date,
    roomId: string,
    professionalId?: string,
  ): Observable<IRoomReservation[]> => {
    let params = new HttpParams().set('dates', date.toISOString().slice(0, 10)).append('days', days);
    if (professionalId) {
      params = params.append('professionalId', professionalId);
    }
    return this.http.get<IRoomReservation[]>(toUrl(this.urlV1, 'rooms', roomId), { params });
  };

  searchAvailability = (
    roomId: string,
    days: number,
    dates: Date[],
    professionalId?: string,
  ): Observable<IRoomReservation[]> => {
    let params = new HttpParams().set('days', days);
    dates.forEach(date => {
      params = params.append('dates', date.toISOString().slice(0, 10));
    });

    if (professionalId) {
      params = params.append('professionalId', professionalId);
    }
    return this.http.get<IRoomReservation[]>(toUrl(this.urlV1, 'rooms', roomId), { params });
  };

  customerSearch = (
    roomId: string,
    treatmentId: string,
    date: Date,
    professionalId: string,
    additionalIds?: string[],
  ): Observable<IAvailableDTO[]> => {
    let params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    params = params.append('roomId', roomId);
    params = params.append('treatmentId', treatmentId);
    if (additionalIds && additionalIds.length) {
      additionalIds.forEach(id => {
        params = params.append('additionalIds', id);
      });
    }
    params = params.append('professionalId', professionalId);

    return this.http.get<IAvailableDTO[]>(toUrl(this.urlV1, 'search'), { params });
  };

  getReservation = (id: string, editPath?: string): Observable<IUpcomingAll | undefined> => {
    const url = toUrl(this.urlV1, id);
    return this.http.get<IUpcomingAll>(editPath ? `${ url }/${ editPath }` : url, { ...skipLoadingOverlay() });
  };

  getReservationHistory = (id: string): Observable<IReservationAll[]> => this.http.get<IReservationAll[]>(
    toUrl(this.urlV1, id, 'history'),
    skipLoadingOverlay(),
  );

  createReservation = (
    reservation: IReservation,
  ): Observable<IApiResponse[]> => this.http.post<IApiResponse[]>(this.urlV1, reservation);

  deleteReservation = (id: string): Observable<IReservation> => this.http.delete<IReservation>(
    toUrl(this.urlV1, id));

  updateReservationById = (
    id: string,
    reservation: IReservation,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.urlV1, id), reservation);

  changeState = (
    reservationId: string,
    event: string,
    extras?: any,
  ): Observable<IReservation | void> => this.http.post<IReservation | void>(
    toUrl(this.urlV1, reservationId, event), extras);

  updateReservationCustomer = (
    reservationId: string,
    customerId: string,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, reservationId, 'customers', customerId), null);

  updateReservationColor = (
    reservationId: string,
    colorId: string,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.urlV1, reservationId, 'colors', colorId),
    null);

  getUpcomingReservation = (): Observable<ICustomerReservation> => this.http.get<ICustomerReservation>(
    toUrl(this.urlV1, 'upcoming'),
  );

  completeReservationPayment = (reservationId: string): Observable<void> => this.http.post<void>(
    toUrl(this.urlV1, reservationId, 'payment', 'complete'),
    null,
  );

  createReview = (
    review: IReview,
  ): Observable<IApiResponse> => this.http.post<IApiResponse>(toUrl(this.urlV1, review.reservationId!, 'reviews'),
    review);

  getReview = (id: string): Observable<IReview | undefined> => this.http.get<IReview>(
    toUrl(this.urlV1, id, 'reviews'), { ...skipLoadingOverlay() },
  );

  updateReservationNote = (
    id: string,
    note?: string,
    customerNote?: string,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.urlV1, id, 'notes'), { note, customerNote });

  updateReservationDiscount = (
    id: string,
    discountId: string,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.urlV1, id, 'discounts', discountId), null);

  updateReservationTimestamp = (
    id: string,
    start: string,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.urlV1, id, 'timestamp'), start);
}
