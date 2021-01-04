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

  update(user: IUser): Observable<IUser> {
    const url = `${this.userUrl}/${user.id}`;
    return this.http.patch<IUser>(url, user);
  }

  delete(id: string | null): Observable<IUser> {
    const url = `${this.userUrl}/${id}`;
    return this.http.delete<IUser>(url);
  }
}
