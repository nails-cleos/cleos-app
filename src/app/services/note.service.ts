import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INote } from '../interfaces/note';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private url = 'notes';
  private urlV1 = `v1/${ this.url }`;

  constructor(private http: HttpClient) {
  }

  public getById(id: string | null): Observable<INote | undefined> {
    return this.http.get<INote>(`${ this.urlV1 }/${ id }`);
  }

  public add(note: INote): Observable<INote> {
    return this.http.post<INote>(this.urlV1, note);
  }

  public delete(id: string | null): Observable<INote> {
    return this.http.delete<INote>(`${ this.urlV1 }/${ id }`);
  }

  public update(note: INote): Observable<INote> {
    return this.http.patch<INote>(`${ this.urlV1 }/${ note.id }`, note);
  }

  public complete(id: string | null): Observable<INote> {
    return this.http.patch<INote>(`${ this.urlV1 }/${ id }/complete`, null);
  }
}
