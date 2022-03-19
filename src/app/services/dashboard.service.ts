import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICardSummary, IEventSummary } from '../interfaces/dashboard';

@Injectable()
export class DashboardService {

  url = 'dashboard';

  constructor(private http: HttpClient) {
  }

  public getCards(date: Date): Observable<ICardSummary> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<ICardSummary>(`${this.url}/cards`, {params});
  }

  public getEvents(date: Date): Observable<IEventSummary> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IEventSummary>(`${this.url}/events`, {params});
  }
}
