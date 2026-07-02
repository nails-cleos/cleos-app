import { inject, Injectable } from '@angular/core';
import { IOverview, IUser, IUserAll } from '../user/user';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role, Token } from '../interfaces/token';
import { IRoomAll } from '../room/room';
import { paginated, Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { ICustomerLastReservation } from '../reservation/reservation';
import { createFilter } from '../util/service-helper';
import { dataURLToBlob } from '../util/file';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
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
  ): Observable<Pagination<IUserAll>> => this.http.get<Pagination<IUserAll>>(
    toUrl(this.userUrlV1, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction, filter) },
  );

  saveUser = (user: IUser, id?: string, role?: Role): Observable<{ response: IApiResponse, key: string }> => {
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
        return this.updateUser(id!, user).pipe(
          map(response => ({ response, key: 'USER.UPDATED.MESSAGE' })),
        );
    }
  };

  getUser = (id: string): Observable<IUserAll | undefined> => this.http.get<IUserAll>(toUrl(this.userUrlV1, id),
    { ...skipLoadingOverlay() });

  getMyUser = (): Observable<IUserAll | undefined> => this.http.get<IUserAll>(toUrl(this.userUrlV1, 'me'),
    { ...skipLoadingOverlay() });

  updateUser = (
    id: string,
    user: IUser,
  ): Observable<IApiResponse> => this.http.patch<IApiResponse>(toUrl(this.userUrlV1, id), user);

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
    id: string,
  ): Observable<IOverview> => this.http.get<IOverview>(toUrl(this.customerUrlV1, id, 'reservations'),
    { ...skipLoadingOverlay() });

  addProfessional = (user: IUser): Observable<IApiResponse> => this.http.post<IApiResponse>(this.professionalUrlV1,
    user);

  addManager = (user: IUser): Observable<IApiResponse> => this.http.post<IApiResponse>(this.officeUrlV1, user);

  deleteUser = (id: string): Observable<void> => this.http.delete<void>(toUrl(this.userUrlV1, id));

  restore = (id: string, user: IUser): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.userUrlV1, id), user);

  resendToken = (id: string): Observable<void> => this.http.post<void>(toUrl(this.userUrlV1, id, 'token'), null);

  getProfessionals = (): Observable<IUserAll[]> => this.http.get<IUserAll[]>(this.professionalUrlV1,
    { ...skipLoadingOverlay() });

  getManagers = (): Observable<IUserAll[]> => this.http.get<IUserAll[]>(this.officeUrlV1, { ...skipLoadingOverlay() });

  getCustomers = (): Observable<IUserAll[]> => this.http.get<IUserAll[]>(this.customerUrlV1,
    { ...skipLoadingOverlay() });

  getCustomerInformation = (
    id: string,
  ): Observable<ICustomerLastReservation> => this.http.get<ICustomerLastReservation>(
    toUrl(this.customerUrlV1, id, 'info'), { ...skipLoadingOverlay() });

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
  ): Observable<IRoomAll[]> => this.http.get<IRoomAll[]>(`${ this.professionalUrlV1 }/${ id }/rooms`,
    { ...skipLoadingOverlay() });

  getAllDisableUsers = (): Observable<IUserAll[]> => this.http.get<IUserAll[]>(this.userUrlV1);

  mergeUsers = (
    oldUserId: string, newUserId: string,
  ): Observable<IUser> => this.http.post<IUser>(`${ this.userUrlV1 }/merge`, { oldUserId, newUserId });
}
