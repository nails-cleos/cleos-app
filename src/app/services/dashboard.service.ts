import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ICardSummary,
  IEventSummary,
  IMonthlyRoomSummary,
  IMonthlySummaryRequest,
  IQuarterRoomSummary,
  IRoomEvents,
  ITotal,
  IYearRoomExport,
  IYearRoomSummary,
} from '../dashboard/dashboard';
import { IReservation } from '../reservation/reservation';
import { toUrl } from '../util/helper';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private url = 'dashboard';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  getCards = (date: Date): Observable<ICardSummary[]> =>
    this.getSummaryData<ICardSummary[]>(date, 'cards');

  getEvents = (date: Date): Observable<IEventSummary[]> =>
    this.getSummaryData<IEventSummary[]>(date, 'events');

  getMyEvent = (date: Date): Observable<IRoomEvents> =>
    this.getSummaryData<IRoomEvents>(date, 'me', 'events');

  updateEvent = (
    reservationId: string,
    reservation: IReservation,
  ): Observable<void> =>
    this.http.patch<void>(
      toUrl(this.urlV1, 'me', 'events', reservationId),
      reservation,
    );

  getMonthlySummary = (date: string): Observable<IMonthlyRoomSummary[]> =>
    this.http.get<IMonthlyRoomSummary[]>(toUrl(this.urlV1, 'summaries', date));

  updateMonthlySummary = (
    date: string,
    type: string,
    totals: ITotal[],
    summaries: IMonthlySummaryRequest[],
    roomId?: string,
  ): Observable<void> =>
    this.http.post<void>(toUrl(this.urlV1, 'summaries', date), {
      totals,
      summaries,
      type,
      roomId,
    });

  getYearSummary = (year: number): Observable<IYearRoomSummary[]> =>
    this.http.get<IYearRoomSummary[]>(toUrl(this.urlV1, 'years', `${year}`));

  exportYearSummary = (year: number): Observable<IYearRoomExport[]> =>
    this.http.get<IYearRoomExport[]>(
      toUrl(this.urlV1, 'years', `${year}`, 'export'),
    );

  getQuarterSummary = (
    year: number,
    quarter: number,
  ): Observable<IQuarterRoomSummary[]> =>
    this.http.get<IQuarterRoomSummary[]>(
      toUrl(this.urlV1, 'years', `${year}`, 'quarters', `${quarter}`),
    );

  private getSummaryData = <T>(date: Date, ...url: string[]): Observable<T> =>
    this.http.get<T>(toUrl(this.urlV1, ...url), {
      params: new HttpParams().set('date', date.toISOString().slice(0, 10)),
    });
}
