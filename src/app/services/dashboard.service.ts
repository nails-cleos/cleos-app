import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICardSummary, IEventSummary, IRoomEvents } from '../interfaces/dashboard';
import { IReservation } from '../interfaces/reservation';

@Injectable()
export class DashboardService {

  private url = 'dashboard';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getCards(date: Date): Observable<ICardSummary> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<ICardSummary>(`${ this.urlV1 }/cards`, { params });
  }

  public getEvents(date: Date): Observable<IEventSummary> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IEventSummary>(`${ this.urlV1 }/events`, { params });
  }

  public meEvents(date: Date): Observable<IRoomEvents> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IRoomEvents>(`${ this.urlV1 }/me/events`, { params });
  }

  public updateEvent(reservation: IReservation): Observable<IRoomEvents> {
    return this.http.patch<IRoomEvents>(`${ this.urlV1 }/me/events/${ reservation.id }`, reservation);
  }

  public getSummary(date: string): Observable<any> {
    return this.http.get<any>(`${ this.urlV1 }/summaries/${ date }`);
  }
}
