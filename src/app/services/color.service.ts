import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { paginated, Pagination } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IColor, IColorAll } from '../color/color';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';
import { SortDirection } from '@angular/material/sort';
import { IApiResponse } from '../interfaces/common';

@Injectable()
export class ColorService {

  private url = 'colors';
  private urlV1 = `v1/${this.url}`;

  private http: HttpClient = inject(HttpClient);

  getColorsPage = (
    page: number,
    sort: string,
    direction: SortDirection,
    size: number,
  ): Observable<Pagination<IColor>> => this.http.get<Pagination<IColor>>(toUrl(this.urlV1, 'pages'),
    { ...paginated(), params: createFilter(page, size, sort, direction) },
  );

  getColorsByTreatmentId = (treatmentId: string): Observable<IColorAll[]> => this.http.get<IColorAll[]>(
    toUrl(this.urlV1, 'treatments', treatmentId),
  );

  getAllColors = (): Observable<IColorAll[]> => this.http.get<IColorAll[]>(this.urlV1);

  getColor = (id: string): Observable<IColor | undefined> => this.http.get<IColor>(toUrl(this.urlV1, id));

  createColor = (color: IColor): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1, color);

  deleteColor = (id: string): Observable<IColor> => this.http.delete<IColor>(toUrl(this.urlV1, id));

  updateColor = (id: string, color: IColor): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id), color,
  );
}
