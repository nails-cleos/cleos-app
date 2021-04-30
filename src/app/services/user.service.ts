import { Injectable } from '@angular/core';
import { IUser, PAGE_SIZE } from '../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Role } from '../interfaces/token';
import { IRoom } from '../interfaces/room';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = 'users';
  private professionalUrl = 'professionals';
  private customerUrl = 'customers';

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number): Observable<IUser[]> {
    let params = new HttpParams().set('page', String(page)).set('size', String(PAGE_SIZE));
    if (sort) {
      params = params.append('sort', sort);
    }
    if (direction) {
      params = params.append('direction', direction);
    }

    return this.http.get<IUser[]>(`${this.url}/pages`, {params});
  }

  public getById(id: string | null): Observable<IUser | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IUser>(url);
  }

  public getMe(): Observable<IUser | undefined> {
    const url = `${this.url}/me`;
    return this.http.get<IUser>(url);
  }

  public update(user: IUser): Observable<IUser> {
    const url = `${this.url}/${user.id}`;
    return this.http.patch<IUser>(url, user);
  }

  public updateMe(user: IUser): Observable<IUser> {
    const url = `${this.url}/me`;
    return this.http.patch<IUser>(url, user);
  }

  public addCustomer(user: IUser): Observable<IUser> {
    return this.http.post(this.customerUrl, user);
  }

  public addProfessional(user: IUser): Observable<IUser> {
    return this.http.post(this.professionalUrl, user);
  }

  public delete(id: string | null): Observable<IUser> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IUser>(url);
  }

  public resend(id: string | null): Observable<any> {
    const url = `${this.url}/${id}/token`;
    return this.http.post(url, null);
  }

  public changePassword(username: string, oldPassword: string, password: string): Observable<any> {
    const url = `${this.url}/me/change-password`;
    return this.http.post(url, {username, oldPassword, password});
  }

  public getAllProfessionals(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.professionalUrl);
  }

  public getAllCustomers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.customerUrl);
  }

  public setRole(userId: string, role: Role): Observable<IUser> {
    let roleName;
    switch (role) {
      case Role.admin:
        roleName = 'admin';
        break;
      case Role.professional:
        roleName = 'professional';
        break;
      case Role.customer:
      default:
        roleName = 'customer';
        break;
    }
    const url = `${this.url}/${userId}/roles/${roleName}`;
    return this.http.post<IUser>(url, null);
  }

  public getRoomByProfessionalId(id: string): Observable<IRoom> {
    return this.http.get<IRoom>(`${this.professionalUrl}/${id}/rooms`);
  }
}
