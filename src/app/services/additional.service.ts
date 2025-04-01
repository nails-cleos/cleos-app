import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PAGE_SIZE } from '../interfaces/pagination';
import { Observable } from 'rxjs';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { createFilter } from '../util/service-helper';
import { toUrl } from '../util/helper';

@Injectable()
export class AdditionalService {

  private url = 'additional';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getAll = (
    sort: string,
    direction: string,
    page: number,
    size: number = PAGE_SIZE
  ): Observable<IAdditional[]> => this.http.get<IAdditional[]>(
    toUrl(this.urlV1, 'pages'), { params: createFilter(page, size, sort, direction) }
  );

  getAllAdditional = (roomId: string, groupId: string): Observable<IAdditional[]> =>
    this.http.get<IAdditional[]>(toUrl(this.urlV1, 'groups'),
      { params: new HttpParams().set('roomId', roomId).set('groupId', groupId) }
    );

  getAdditionalList = (): Observable<IAdditionalAll[]> => this.http.get<IAdditionalAll[]>(this.urlV1);

  getById = (id: string): Observable<IAdditional | undefined> => this.http.get<IAdditional>(toUrl(this.urlV1, id));

  add = (additional: IAdditional): Observable<IAdditional> => this.http.post<IAdditional>(this.urlV1, additional);

  delete = (id: string): Observable<IAdditional> => this.http.delete<IAdditional>(toUrl(this.urlV1, id));

  update = (additional: IAdditional): Observable<IAdditional> => this.http.patch<IAdditional>(
    toUrl(this.urlV1, additional.id!), additional
  );

  updateSort = (additionalList: ISorted[]): Observable<IAdditionalAll[]> => this.http.patch<IAdditionalAll[]>(
    this.urlV1, additionalList
  );
}
