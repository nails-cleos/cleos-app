import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICardSummary, IEventSummary, IMonthlySummaryRequest, IRoomEvents } from '../interfaces/dashboard';
import { IReservation } from '../interfaces/reservation';
import { toUrl } from '../util/helper';

@Injectable()
export class DashboardService {

  private url = 'dashboard';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getSummaries = (date: Date): Observable<ICardSummary> => this.getSummaryData<ICardSummary>(date, 'cards');

  eventsSummaries = (date: Date): Observable<IEventSummary> => this.getSummaryData<IEventSummary>(date, 'events');

  meEvent = (date: Date): Observable<IRoomEvents> => this.getSummaryData<IRoomEvents>(date, 'me', 'events');

  updateEventById = (
    reservation: IReservation,
  ): Observable<IRoomEvents> => this.http.patch<IRoomEvents>(
    toUrl(this.urlV1, 'me', 'events', reservation.id!),
    reservation,
  );

  getMonthlySummary = (date: string): Observable<any> => this.http.get<any>(toUrl(this.urlV1, 'summaries', date));

  updateMonthlySummary = (
    date: string, type: string, totals: any, summaries: IMonthlySummaryRequest[], roomId: string,
  ): Observable<void> => this.http.post<void>(
    toUrl(this.urlV1, 'summaries', date), { totals, summaries, type, roomId },
  );

  getYearSummary = (year: number): Observable<any> => this.http.get<any>(toUrl(this.urlV1, 'years', `${ year }`));

  exportYearSummary = (year: number): Observable<any> => this.http.get<any>(
    toUrl(this.urlV1, 'years', `${ year }`, 'export'),
  );

  getQuarterSummary = (
    year: number, quarter: number,
  ): Observable<any> => this.http.get<any>(toUrl(this.urlV1, 'years', `${ year }`, 'quarters', `${ quarter }`));

  private getSummaryData = <T>(date: Date, ...url: string[]): Observable<T> => this.http.get<T>(
    toUrl(this.urlV1, ...url),
    { params: new HttpParams().set('date', date.toISOString().slice(0, 10)) },
  );
}
