import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IOffice } from '../interfaces/office';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';

@Injectable({
  providedIn: 'root',
})
export class OfficeService {

  private url = 'offices';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getOfficesPage = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
  ): Observable<IOffice[]> => this.http.get<IOffice[]>(
    toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) },
  );

  findOfficeById = (id: string): Observable<IOffice | undefined> => this.http.get<IOffice>(toUrl(this.urlV1, id));

  createOffice = (office: IOffice): Observable<IOffice> => this.http.post<IOffice>(this.urlV1, office);

  deleteOfficeById = (id: string): Observable<IOffice> => this.http.delete<IOffice>(toUrl(this.urlV1, id));

  updateOfficeById = (
    office: IOffice,
  ): Observable<IOffice> => this.http.patch<IOffice>(toUrl(this.urlV1, office.id!), office);
}
