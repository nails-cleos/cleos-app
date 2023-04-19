import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITracking } from '../interfaces/reservation';

@Injectable()
export class TrackingService {

  private url = 'tracking';
  private urlV1 = `v1/${this.url}`;

  constructor(private http: HttpClient) {
  }

  public getAll(): Observable<ITracking[]> {
    return this.http.get<ITracking[]>(this.urlV1);
  }

  public findByReservationId(reservationId: string): Observable<ITracking> {
    return this.http.get<ITracking>(`${this.urlV1}/reservations/${reservationId}`);
  }

  public executeByReservationId(reservationId: string): Observable<ITracking> {
    return this.http.post<ITracking>(`${this.urlV1}/reservations/${reservationId}`, {});
  }
}
