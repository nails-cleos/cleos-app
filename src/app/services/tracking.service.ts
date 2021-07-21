import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITracking } from '../interfaces/reservation';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  url = 'tracking';

  constructor(private http: HttpClient) {
  }

  public getAll(): Observable<ITracking[]> {
    return this.http.get<ITracking[]>(this.url);
  }

  public findByReservationId(reservationId: string): Observable<ITracking> {
    return this.http.get<ITracking>(`${this.url}/reservations/${reservationId}`);
  }
}
