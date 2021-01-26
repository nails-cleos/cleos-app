import { Injectable } from '@angular/core';
import { IUser, PAGE_SIZE } from '../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl = 'users';

  constructor(private http: HttpClient) {
  }

  getAll(sort: string, direction: string, page: number): Observable<IUser[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(PAGE_SIZE));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IUser[]>(this.userUrl, {params});
  }

  getById(id: string | null): Observable<IUser | undefined> {
    const url = `${this.userUrl}/${id}`;
    return this.http.get<IUser>(url);
  }

  getMe(): Observable<IUser | undefined> {
    const url = `${this.userUrl}/me`;
    return this.http.get<IUser>(url);
  }

  update(user: IUser): Observable<IUser> {
    const url = `${this.userUrl}/${user.id}`;
    return this.http.patch<IUser>(url, user);
  }

  updateMe(user: IUser): Observable<IUser> {
    const url = `${this.userUrl}/me`;
    return this.http.patch<IUser>(url, user);
  }

  addCustomer(user: IUser): Observable<IUser> {
    return this.http.post('customers', user);
  }

  addProfessional(user: IUser): Observable<IUser> {
    return this.http.post('professionals', user);
  }

  delete(id: string | null): Observable<IUser> {
    const url = `${this.userUrl}/${id}`;
    return this.http.delete<IUser>(url);
  }

  resend(id: string | null): Observable<any> {
    const url = `${this.userUrl}/${id}/token`;
    return this.http.post(url, null);
  }

  public changePassword(oldPassword: string, password: string): Observable<any> {
    const url = `${this.userUrl}/me/change-password`;
    return this.http.post(url, {oldPassword, password});
  }

  getAllProfessional(): Observable<IUser[]> {

    return this.http.get<IUser[]>('professionals');
  }
}
