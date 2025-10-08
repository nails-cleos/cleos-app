import { inject, Injectable } from '@angular/core';
import { IOverview, IUser } from '../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role, Token } from '../interfaces/token';
import { IRoom } from '../interfaces/room';
import { Pagination } from '../interfaces/pagination';
import { ICustomerLastReservation } from '../interfaces/reservation';
import { createFilter } from '../util/service-helper';
import { dataURLToBlob } from '../util/file';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class UserService {

  private userUrl = 'users';
  private professionalUrl = 'professionals';
  private customerUrl = 'customers';
  private officeUrl = 'offices/managers';

  private userUrlV1 = `v1/${ this.userUrl }`;
  private professionalUrlV1 = `v1/${ this.professionalUrl }`;
  private customerUrlV1 = `v1/${ this.customerUrl }`;
  private officeUrlV1 = `v1/${ this.officeUrl }`;

  private http: HttpClient = inject(HttpClient);

  getUsersPage = (
    page: number, sort: string, direction: SortDirection, size: number, filter?: string,
  ): Observable<Pagination<IUser>> => this.http.get<Pagination<IUser>>(
    toUrl(this.userUrlV1, 'pages'),
    { params: createFilter(page, size, sort, direction, filter) },
  );

  saveUser = (user: IUser, role?: Role): Observable<{ response: IApiResponse, key: string }> => {
    switch (role) {
      case Role.customer:
        return this.createCustomer(user).pipe(
          map(response => ({ response, key: 'USER.CUSTOMER' })),
        );
      case Role.manager:
        return this.addManager(user).pipe(
          map(response => ({ response, key: 'USER.MANAGER' })),
        );
      case Role.professional:
        return this.addProfessional(user).pipe(
          map(response => ({ response, key: 'USER.PROFESSIONAL' })),
        );
      default:
        return this.updateUser(user).pipe(
          map(response => ({ response, key: 'USER.UPDATED.MESSAGE' })),
        );
    }
  };

  getUser = (
    id: string,
  ): Observable<IUser | undefined> => this.http.get<IUser>(toUrl(this.userUrlV1, id));

  getMyUser = (): Observable<IUser | undefined> => this.http.get<IUser>(toUrl(this.userUrlV1, 'me'));

  updateUser = (
    user: IUser,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.userUrlV1, user.id!), user);

  updateMyUser = (user: IUser): Observable<Token> => this.http.patch<Token>(toUrl(this.userUrlV1, 'me'), user);

  updateMyPhoto = (resizedImageDataUrl: string): Observable<Token> => {
    const blob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', blob, 'resized-image.jpg');

    const headers = new HttpHeaders().set('Upload', 'true');

    return this.http.patch<Token>(toUrl(this.userUrlV1, 'me', 'photo'), formData, { headers });
  };

  createCustomer = (user: IUser): Observable<IApiResponse> => this.http.post<IApiResponse>(this.customerUrlV1, user);

  getCustomerOverview = (
    id: string | null,
  ): Observable<IOverview> => this.http.get<IOverview>(toUrl(this.customerUrlV1, id ? id : 'me', 'reservations'));

  addProfessional = (user: IUser): Observable<IApiResponse> => this.http.post<IApiResponse>(this.professionalUrlV1,
    user);

  addManager = (user: IUser): Observable<IApiResponse> => this.http.post<IApiResponse>(this.officeUrlV1, user);

  deleteUser = (id: string): Observable<IUser> => this.http.delete<IUser>(toUrl(this.userUrlV1, id));

  restore = (id: string, user: IUser): Observable<IUser> => this.http.patch<IUser>(toUrl(this.userUrlV1, id), user);

  resendToken = (id: string): Observable<void> => this.http.post<void>(toUrl(this.userUrlV1, id, 'token'), null);

  getProfessionals = (): Observable<IUser[]> => this.http.get<IUser[]>(this.professionalUrlV1);

  getManagers = (): Observable<IUser[]> => this.http.get<IUser[]>(this.officeUrlV1);

  getCustomers = (): Observable<IUser[]> => this.http.get<IUser[]>(this.customerUrlV1);

  getCustomerInformation = (
    id: string,
  ): Observable<ICustomerLastReservation> => this.http.get<ICustomerLastReservation>(
    toUrl(this.customerUrlV1, id, 'info'));

  setRole = (userId: string, role: Role): Observable<IUser> => {
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
    return this.http.post<IUser>(toUrl(this.userUrlV1, userId, 'roles', roleName), null);
  };

  getAllRoomsByProfessionalId = (
    id: string,
  ): Observable<IRoom[]> => this.http.get<IRoom[]>(`${ this.professionalUrlV1 }/${ id }/rooms`);

  getAllDisableUsers = (): Observable<IUser[]> => this.http.get<IUser[]>(this.userUrlV1);

  mergeUsers = (
    oldUserId: string, newUserId: string,
  ): Observable<IUser> => this.http.post<IUser>(`${ this.userUrlV1 }/merge`, { oldUserId, newUserId });
}
