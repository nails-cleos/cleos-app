import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INote } from '../interfaces/note';
import { toUrl } from '../util/helper';
import { IApiResponse } from '../interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class NoteService {

  private url = 'notes';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  getNote = (id: string): Observable<INote | undefined> => this.http.get<INote>(toUrl(this.urlV1, id));

  createNote = (note: INote): Observable<IApiResponse> => this.http.post<IApiResponse>(this.urlV1, note);

  deleteNote = (id: string): Observable<INote> => this.http.delete<INote>(toUrl(this.urlV1, id));

  updateNote = (id: string, note: INote): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id), note);

  completeNote = (id: string): Observable<IApiResponse> => this.http.patch<IApiResponse>(
    toUrl(this.urlV1, id, 'complete'), null);
}
