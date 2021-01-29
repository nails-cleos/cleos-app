import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IReservation, PAGE_SIZE } from '../interfaces/reservation';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  url = 'reservations';

  constructor(private http: HttpClient) {
  }

  getAll(sort: string, direction: string, page: number): Observable<IReservation[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(PAGE_SIZE));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IReservation[]>(`${this.url}/pages`, {params});
  }

  search(roomId: string, date: Date): Observable<IReservation[]> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IReservation[]>(`${this.url}/rooms/${roomId}`, {params});
  }

  getById(id: string | null): Observable<IReservation | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IReservation>(url);
  }

  add(reservation: IReservation): Observable<IReservation> {
    console.log(reservation)
    return this.http.post<IReservation>(`${this.url}/customers`, reservation);
  }

  delete(id: string | null): Observable<IReservation> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IReservation>(url);
  }

  update(reservation: IReservation): Observable<IReservation> {
    const url = `${this.url}/${reservation.id}`;
    return this.http.patch<IReservation>(url, reservation);
  }
}
