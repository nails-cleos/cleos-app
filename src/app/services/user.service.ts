import { Injectable } from '@angular/core';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role } from '../interfaces/token';
import { IRoom } from '../interfaces/room';
import { PAGE_SIZE } from '../interfaces/pagination';
import { ICustomerLastReservation } from '../interfaces/reservation';
import { createFilter } from '../util/service-helper';
import { dataURLToBlob } from '../util/file';

@Injectable()
export class UserService {

  private userUrl = 'users';
  private professionalUrl = 'professionals';
  private customerUrl = 'customers';
  private officeUrl = `offices/managers`;


  private userUrlV1 = `v1/${ this.userUrl }`;
  private professionalUrlV1 = `v1/${ this.professionalUrl }`;
  private customerUrlV1 = `v1/${ this.customerUrl }`;
  private officeUrlV1 = `v1/${ this.officeUrl }`;

  constructor(private http: HttpClient) {
  }

  public getAll(sort: string, direction: string, page: number, size: number = PAGE_SIZE,
                filter: string): Observable<IUser[]> {
    const params = createFilter(page, size, sort, direction, filter);

    return this.http.get<IUser[]>(`${ this.userUrlV1 }/pages`, { params });
  }

  public getById(id: string | null): Observable<IUser | undefined> {
    const url = `${ this.userUrlV1 }/${ id }`;
    return this.http.get<IUser>(url);
  }

  public getMe(): Observable<IUser | undefined> {
    const url = `${ this.userUrlV1 }/me`;
    return this.http.get<IUser>(url);
  }

  public update(user: IUser): Observable<IUser> {
    const url = `${ this.userUrlV1 }/${ user.id }`;
    return this.http.patch<IUser>(url, user);
  }

  public updateMe(user: IUser): Observable<IUser> {
    const url = `${ this.userUrlV1 }/me`;
    return this.http.patch<IUser>(url, user);
  }

  public updateMePhoto(resizedImageDataUrl: string): Observable<IUser> {
    const blob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', blob, 'resized-image.jpg');

    const headers = new HttpHeaders().set('Upload', 'true');

    return this.http.patch<IUser>(`${ this.userUrlV1 }/me/photo`, formData, { headers });
  }

  public addCustomer(user: IUser): Observable<IUser> {
    return this.http.post(this.customerUrlV1, user);
  }

  public getOverview(id: string | null): Observable<IUser | undefined> {
    const url = `${ this.customerUrlV1 }/${ id ? id : 'me' }/reservations`;
    return this.http.get<IUser>(url);
  }

  public addProfessional(user: IUser): Observable<IUser> {
    return this.http.post(this.professionalUrlV1, user);
  }

  public addManager(user: IUser): Observable<IUser> {
    return this.http.post(this.officeUrlV1, user);
  }

  public delete(id: string | null): Observable<IUser> {
    const url = `${ this.userUrlV1 }/${ id }`;
    return this.http.delete<IUser>(url);
  }

  public restore(user: IUser): Observable<IUser> {
    const url = `${ this.userUrlV1 }/${ user.id }`;
    return this.http.patch<IUser>(url, user);
  }

  public resend(id: string | null): Observable<any> {
    const url = `${ this.userUrlV1 }/${ id }/token`;
    return this.http.post(url, null);
  }

  public getAllProfessionals(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.professionalUrlV1);
  }

  public getAllManagers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.officeUrlV1);
  }

  public getAllCustomers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.customerUrlV1);
  }

  public getCustomerInformation(id: string): Observable<ICustomerLastReservation[]> {
    return this.http.get<ICustomerLastReservation[]>(`${ this.customerUrlV1 }/${ id }/info`);
  }

  public setRole(userId: string, role: Role): Observable<IUser> {
    let roleName;
    switch (role) {
      case Role.admin:
        roleName = 'admin';
        break;
      case Role.manager:
        roleName = 'manager';
        break;
      case Role.professional:
        roleName = 'professional';
        break;
      case Role.customer:
      default:
        roleName = 'customer';
        break;
    }
    const url = `${ this.userUrlV1 }/${ userId }/roles/${ roleName }`;
    return this.http.post<IUser>(url, null);
  }

  public getRoomByProfessionalId(id: string): Observable<IRoom> {
    return this.http.get<IRoom>(`${ this.professionalUrlV1 }/${ id }/rooms`);
  }

  public getAllDisableUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.userUrlV1);
  }

  public mergeUsers(mergeUserRequest: any): Observable<IUser> {
    return this.http.post<IUser>(`${ this.userUrlV1 }/merge`, mergeUserRequest);
  }
}
