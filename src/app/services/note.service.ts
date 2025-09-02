import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INote } from '../interfaces/note';
import { toUrl } from '../util/helper';

@Injectable({
  providedIn: 'root',
})
export class NoteService {

  private url = 'notes';
  private urlV1 = `v1/${ this.url }`;

  private http: HttpClient = inject(HttpClient);

  findNoteById = (id: string): Observable<INote | undefined> => this.http.get<INote>(toUrl(this.urlV1, id));

  createNote = (note: INote): Observable<INote> => this.http.post<INote>(this.urlV1, note);

  deleteNoteById = (id: string): Observable<INote> => this.http.delete<INote>(toUrl(this.urlV1, id));

  updateNoteById = (note: INote): Observable<INote> => this.http.patch<INote>(toUrl(this.urlV1, note.id!), note);

  complete = (id: string): Observable<INote> => this.http.patch<INote>(toUrl(this.urlV1, id, 'complete'), null);
}
