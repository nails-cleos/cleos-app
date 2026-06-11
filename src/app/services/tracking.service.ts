import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITracking } from '../reservation/reservation';
import { toUrl } from '../util/helper';
import { skipLoadingOverlay } from '../interfaces/pagination';

@Injectable()
export class TrackingService {

  private url = 'tracking';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getTrackingByReservationId = (
    reservationId: string,
  ): Observable<ITracking> => this.http.get<ITracking>(
    toUrl(this.urlV1, 'reservations', reservationId),
    skipLoadingOverlay(),
  );

  executeTrackingByReservationId = (
    reservationId: string,
  ): Observable<ITracking> => this.http.post<ITracking>(toUrl(this.urlV1, 'reservations', reservationId), {});

  updateTrackingByReservationId = (
    reservationId: string,
    started?: string,
    completed?: string,
  ): Observable<ITracking> => this.http.patch<ITracking>(
    toUrl(this.urlV1, 'reservations', reservationId),
    { started, completed },
  );
}
