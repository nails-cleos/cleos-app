import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICardSummary, IEventSummary } from '../interfaces/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  url = 'dashboard';

  constructor(private http: HttpClient) {
  }

  public getCards(): Observable<ICardSummary> {
    return this.http.get<ICardSummary>(`${this.url}/cards`);
  }

  public getEvents(): Observable<IEventSummary> {
    return this.http.get<IEventSummary>(`${this.url}/events`);
  }
}
