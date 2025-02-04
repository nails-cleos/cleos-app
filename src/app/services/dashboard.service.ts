import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICardSummary, IEventSummary, IMonthlySummaryRequest, IRoomEvents } from '../interfaces/dashboard';
import { IReservation } from '../interfaces/reservation';

@Injectable()
export class DashboardService {

  private url = 'dashboard';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  getCards = (date: Date): Observable<ICardSummary> => {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<ICardSummary>(`${ this.urlV1 }/cards`, { params });
  }

  getEvents = (date: Date): Observable<IEventSummary> => {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IEventSummary>(`${ this.urlV1 }/events`, { params });
  }

  meEvents = (date: Date): Observable<IRoomEvents> => {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IRoomEvents>(`${ this.urlV1 }/me/events`, { params });
  }

  updateEvent = (
    reservation: IReservation
  ): Observable<IRoomEvents> => this.http.patch<IRoomEvents>(
    `${ this.urlV1 }/me/events/${ reservation.id }`,
    reservation
  )

  getSummary = (date: string): Observable<any> => this.http.get<any>(`${ this.urlV1 }/summaries/${ date }`)

  saveMonthlySummary = (
    date: string, type: string, totals: any, summaries: IMonthlySummaryRequest[], roomId: string
  ): Observable<void> => this.http.post<void>(
    `${ this.urlV1 }/summaries/${ date }`, { totals, summaries, type, roomId }
  );

  getYearSummary = (year: number): Observable<any> => this.http.get<any>(`${ this.urlV1 }/years/${ year }`)

  getYearExport = (year: number): Observable<any> => this.http.get<any>(`${ this.urlV1 }/years/${ year }/export`)

  getQuarterSummary = (
    year: number, quarter: number
  ): Observable<any> => this.http.get<any>(`${ this.urlV1 }/years/${ year }/quarters/${ quarter }`)
}
