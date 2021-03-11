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

  public getAllPage(sort: string, direction: string, page: number, size: number = PAGE_SIZE): Observable<IReservation[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IReservation[]>(`${this.url}/pages`, {params});
  }

  public getAll(): Observable<IReservation[]> {
    return this.http.get<IReservation[]>(this.url);
  }

  public getAllGroupingByRoom(): Observable<IReservation[]> {
    const params = new HttpParams().set('date', new Date().toISOString().slice(0, 10));
    return this.http.get<any>(`${this.url}/rooms`, {params});
  }

  public search(roomId: string, date: Date): Observable<IReservation[]> {
    const params = new HttpParams().set('date', date.toISOString().slice(0, 10));
    return this.http.get<IReservation[]>(`${this.url}/rooms/${roomId}`, {params});
  }

  public getById(id: string | null): Observable<IReservation | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IReservation>(url);
  }

  public add(reservation: IReservation): Observable<IReservation> {
    return this.http.post<IReservation>(this.url, reservation);
  }

  public delete(id: string | null): Observable<IReservation> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IReservation>(url);
  }

  public update(reservation: IReservation): Observable<IReservation> {
    const url = `${this.url}/${reservation.id}`;
    return this.http.patch<IReservation>(url, reservation);
  }

  public changeState(reservationId: string, event: string): Observable<IReservation> {
    return this.http.post<IReservation>(`${this.url}/${reservationId}/${event}`, null);
  }
}
