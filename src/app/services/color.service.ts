import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IColor } from '../interfaces/color';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';

@Injectable()
export class ColorService {

  private url = 'colors';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getColorsPage = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE,
  ): Observable<IColor[]> => this.http.get<IColor[]>(toUrl(this.urlV1, 'pages'),
    { params: createFilter(page, size, sort, direction) },
  );

  findColorsByTreatmentId = (treatmentId: string): Observable<IColor[]> => this.http.get<IColor[]>(
    toUrl(this.urlV1, 'treatments', treatmentId),
  );

  getAllColors = (): Observable<IColor[]> => this.http.get<IColor[]>(this.urlV1);

  findColorById = (id: string): Observable<IColor | undefined> => this.http.get<IColor>(toUrl(this.urlV1, id));

  createColor = (color: IColor): Observable<IColor> => this.http.post<IColor>(this.urlV1, color);

  deleteColorById = (id: string): Observable<IColor> => this.http.delete<IColor>(toUrl(this.urlV1, id));

  updateColorById = (color: IColor): Observable<IColor> => this.http.patch<IColor>(toUrl(this.urlV1, color.id!), color);
}
