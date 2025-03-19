import { inject, Injectable } from '@angular/core';
import { IUser } from '../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role } from '../interfaces/token';
import { IRoom } from '../interfaces/room';
import { PAGE_SIZE } from '../interfaces/pagination';
import { ICustomerLastReservation } from '../interfaces/reservation';
import { createFilter } from '../util/service-helper';
import { dataURLToBlob } from '../util/file';
import { toUrl } from "../util/helper";

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

  private http: HttpClient = inject(HttpClient);

  getAll = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
    filter: string
  ): Observable<IUser[]> => this.http.get<IUser[]>(
    toUrl(this.userUrlV1, 'pages'),
    { params: createFilter(page, size, sort, direction, filter) }
  );

  getById = (
    id: string
  ): Observable<IUser | undefined> => this.http.get<IUser>(toUrl(this.userUrlV1, id));

  getMe = (): Observable<IUser | undefined> => this.http.get<IUser>(toUrl(this.userUrlV1, 'me'));

  update = (
    user: IUser
  ): Observable<IUser> => this.http.patch<IUser>(toUrl(this.userUrlV1, user.id!!), user);

  updateMe = (user: IUser): Observable<IUser> => this.http.patch<IUser>(toUrl(this.userUrlV1, 'me'), user);

  updateMePhoto = (resizedImageDataUrl: string): Observable<IUser> => {
    const blob = dataURLToBlob(resizedImageDataUrl);
    const formData = new FormData();
    formData.append('file', blob, 'resized-image.jpg');

    const headers = new HttpHeaders().set('Upload', 'true');

    return this.http.patch<IUser>(toUrl(this.userUrlV1, 'me', 'photo'), formData, { headers });
  }

  addCustomer = (user: IUser): Observable<IUser> => this.http.post(this.customerUrlV1, user);

  getOverview = (
    id: string | null
  ): Observable<IUser | undefined> => this.http.get<IUser>(toUrl(this.customerUrlV1, id ? id : 'me', 'reservations'));

  addProfessional = (user: IUser): Observable<IUser> => this.http.post(this.professionalUrlV1, user);

  addManager = (user: IUser): Observable<IUser> => this.http.post(this.officeUrlV1, user);

  delete = (id: string): Observable<IUser> => this.http.delete<IUser>(toUrl(this.userUrlV1, id));

  restore = (user: IUser): Observable<IUser> => this.http.patch<IUser>(toUrl(this.userUrlV1, user.id!!), user);

  resend = (id: string): Observable<any> => this.http.post(toUrl(this.userUrlV1, id, 'token'), null);

  getAllProfessionals = (): Observable<IUser[]> => this.http.get<IUser[]>(this.professionalUrlV1);

  getAllManagers = (): Observable<IUser[]> => this.http.get<IUser[]>(this.officeUrlV1);

  getAllCustomers = (): Observable<IUser[]> => this.http.get<IUser[]>(this.customerUrlV1);

  getCustomerInformation = (id: string): Observable<ICustomerLastReservation[]> => this.http.get<ICustomerLastReservation[]>(
    toUrl(this.customerUrlV1, id, 'info')
  );

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

  getRoomByProfessionalId = (
    id: string
  ): Observable<IRoom> => this.http.get<IRoom>(`${ this.professionalUrlV1 }/${ id }/rooms`);

  getAllDisableUsers = (): Observable<IUser[]> => this.http.get<IUser[]>(this.userUrlV1);

  mergeUsers = (
    mergeUserRequest: any
  ): Observable<IUser> => this.http.post<IUser>(`${ this.userUrlV1 }/merge`, mergeUserRequest);
}
