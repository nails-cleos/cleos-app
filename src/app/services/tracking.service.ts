import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITracking } from '../interfaces/reservation';
import { toUrl } from "../util/helper";

@Injectable()
export class TrackingService {

  private url = 'tracking';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAll = (): Observable<ITracking[]> => this.http.get<ITracking[]>(this.urlV1);

  findByReservationId = (
    reservationId: string
  ): Observable<ITracking> => this.http.get<ITracking>(toUrl(this.urlV1, 'reservations', reservationId));

  executeByReservationId = (
    reservationId: string
  ): Observable<ITracking> => this.http.post<ITracking>(toUrl(this.urlV1, 'reservations', reservationId), {});

  updateByReservationId = (
    reservationId: string,
    started?: string,
    completed?: string
  ): Observable<ITracking> => this.http.patch<ITracking>(
    toUrl(this.urlV1, 'reservations', reservationId),
    { started, completed }
  );
}
