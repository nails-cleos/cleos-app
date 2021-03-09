import { Injectable } from '@angular/core';
import { IUser, PAGE_SIZE } from '../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Role } from '../interfaces/token';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = 'users';
  private professionalUrl = 'professionals';
  private customerUrl = 'customers';

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

    return this.http.get<IUser[]>(`${this.url}/pages`, {params});
  }

  getById(id: string | null): Observable<IUser | undefined> {
    const url = `${this.url}/${id}`;
    return this.http.get<IUser>(url);
  }

  getMe(): Observable<IUser | undefined> {
    const url = `${this.url}/me`;
    return this.http.get<IUser>(url);
  }

  update(user: IUser): Observable<IUser> {
    const url = `${this.url}/${user.id}`;
    return this.http.patch<IUser>(url, user);
  }

  updateMe(user: IUser): Observable<IUser> {
    const url = `${this.url}/me`;
    return this.http.patch<IUser>(url, user);
  }

  addCustomer(user: IUser): Observable<IUser> {
    return this.http.post(this.customerUrl, user);
  }

  addProfessional(user: IUser): Observable<IUser> {
    return this.http.post(this.professionalUrl, user);
  }

  delete(id: string | null): Observable<IUser> {
    const url = `${this.url}/${id}`;
    return this.http.delete<IUser>(url);
  }

  resend(id: string | null): Observable<any> {
    const url = `${this.url}/${id}/token`;
    return this.http.post(url, null);
  }

  public changePassword(username: string, oldPassword: string, password: string): Observable<any> {
    const url = `${this.url}/me/change-password`;
    return this.http.post(url, {username, oldPassword, password});
  }

  getAllProfessionals(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.professionalUrl);
  }

  getAllCustomers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.customerUrl);
  }

  setRole(userId: string, role: Role): Observable<IUser> {
    let roleName;
    switch (role) {
      case Role.Admin:
        roleName = 'admin';
        break;
      case Role.Professional:
        roleName = 'professional';
        break;
      case Role.Customer:
      default:
        roleName = 'customer';
        break;
    }
    const url = `${this.url}/${userId}/roles/${roleName}`;
    return this.http.post<IUser>(url, null);
  }
}
