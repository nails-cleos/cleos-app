import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  completeNote,
  createNote,
  deleteNote,
  getAllProfessional,
  getNote,
  noteFailure,
  noteSaveSuccess,
  noteSelected,
  noteSuccess,
  updateNote,
} from '../note.actions';
import { TranslateService } from '@ngx-translate/core';
import { NoteService } from '../../services/note.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { INote } from '../../interfaces/note';
import { IUserAll } from '../../interfaces/user';
import { IApiResponse, success, successResponse } from '../../interfaces/common';

@Injectable()
export class NoteEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly noteService: NoteService = inject(NoteService);
  private readonly router: Router = inject(Router);
  private readonly userService: UserService = inject(UserService);

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getNote),
    switchMap(({ id }) =>
      this.noteService.getNote(id).pipe(
        map((selected?: INote) => noteSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(noteFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createNote),
    switchMap(({ note }) =>
      this.noteService.createNote(note).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('NOTE.CREATED.MESSAGE', { description: response.name });
          const path = `notes/${response.id}`;
          return successResponse(noteSaveSuccess, message, path, 'reservation/calendar');
        }),
        catchError((err: HttpErrorResponse) => of(noteFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateNote),
    switchMap(({ id, note }) =>
      this.noteService.updateNote(id, note).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('NOTE.UPDATED.MESSAGE', { description: response.name });
          const path = `notes/${response.id}`;
          return successResponse(noteSaveSuccess, message, path, 'reservation/calendar');
        }),
        catchError((err: HttpErrorResponse) => of(noteFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteNote),
    switchMap(({ id, description }) =>
      this.noteService.deleteNote(id).pipe(
        switchMap(() => {
          const message = this.translate.instant('NOTE.UPDATED.MESSAGE', { description });
          return success(noteSaveSuccess, message, undefined, false, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(noteFailure({ error: err.error }))),
      )),
  ));

  complete$ = createEffect(() => this.actions.pipe(
    ofType(completeNote),
    switchMap(({ id }) =>
      this.noteService.completeNote(id).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('NOTE.COMPLETED.MESSAGE', { description: response.name });
          const path = `notes/${response.id}`;
          return successResponse(noteSaveSuccess, message, path, 'reservation/calendar');
        }),
        catchError((err: HttpErrorResponse) => of(noteFailure({ error: err.error }))),
      )),
  ));

  getAllProfessional$ = createEffect(() => this.actions.pipe(
    ofType(getAllProfessional),
    switchMap(() =>
      this.userService.getProfessionals().pipe(
        map((data: IUserAll[]) => noteSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(noteFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(noteSelected),
    tap(({ selected }) => this.router.navigate([this.translate.getCurrentLang(), 'notes', selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(noteSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(noteSaveSuccess),
  ), { dispatch: false });
}
