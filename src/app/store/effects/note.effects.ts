import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CreateNote,
  DeleteNote,
  GetNote,
  NoteActionTypes,
  CompleteNote,
  NoteFailure,
  NoteSaveSuccess,
  NoteSelected,
  NoteSuccess,
  UpdateNote,
} from '../note.actions';
import { TranslateService } from '@ngx-translate/core';
import { NoteService } from '../../services/note.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { INote } from '../../interfaces/note';
import { IUser } from '../../interfaces/user';
import { IApiResponse, success } from '../../interfaces/common';

@Injectable()
export class NoteEffects {

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.getNote),
    switchMap((action: GetNote) =>
      this.noteService.getNote(action.id).pipe(
        switchMap((note?: INote) => of(new NoteSelected(note))),
        catchError((err: HttpErrorResponse) => of(new NoteFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.createNote),
    switchMap((action: CreateNote) =>
      this.noteService.createNote(action.note).pipe(
        switchMap((response: IApiResponse) => this.requestSuccess('CREATED', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new NoteFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.updateNote),
    switchMap((action: UpdateNote) =>
      this.noteService.updateNote(action.id, action.note).pipe(
        switchMap((response: IApiResponse) => this.requestSuccess('UPDATED', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new NoteFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.deleteNote),
    switchMap((action: DeleteNote) =>
      this.noteService.deleteNote(action.id).pipe(
        switchMap(() => this.requestSuccess('DELETED', action.description)),
        catchError((err: HttpErrorResponse) => of(new NoteFailure(err.error))),
      )),
  ));

  complete$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.completeNote),
    switchMap((action: CompleteNote) =>
      this.noteService.completeNote(action.id).pipe(
        switchMap((response: INote) => this.requestSuccess('COMPLETED', response.description!, response.id)),
        catchError((err: HttpErrorResponse) => of(new NoteFailure(err.error))),
      )),
  ));

  getAllProfessional$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.getAllProfessional),
    switchMap(() =>
      this.userService.getProfessionals().pipe(
        switchMap((response: IUser[]) => of(new NoteSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new NoteFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.noteSelected),
    tap((data: NoteSelected) => this.router.navigate([this.translate.currentLang, 'notes', data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.noteSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(NoteActionTypes.noteSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private noteService: NoteService, private router: Router, private userService: UserService) {
  }

  private requestSuccess(key: string, description?: string, id?: string): Observable<NoteSaveSuccess> {
    const message = this.translate.instant(`NOTE.${ key }.MESSAGE`, { description });
    const path = id ? `notes/${ id }` : undefined;
    return success(NoteSaveSuccess, message, path);
  }
}
