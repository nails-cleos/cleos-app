import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsNote from '../note.actions';
import { NoteSaveSuccess } from '../note.actions';
import { TranslateService } from '@ngx-translate/core';
import { NoteService } from '../../services/note.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Injectable()
export class NoteEffects {

  findOne$ = createEffect(() => this.actions.pipe(ofType(fromActionsNote.NoteActionTypes.noteFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.noteService.getById(payload).pipe(
      switchMap((note: any) => of(new fromActionsNote.NoteSelected(note))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNote.NoteFailure({ error: err.error })))
    ))
  ));

  save$ = createEffect(() => this.actions.pipe(ofType(fromActionsNote.NoteActionTypes.noteSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.noteService.add(payload).pipe(
      switchMap((response: any) => this.success('CREATED', response.description)),
      catchError((err: HttpErrorResponse) => of(new fromActionsNote.NoteFailure({ error: err.error })))
    ))
  ));

  update = createEffect(() => this.actions.pipe(ofType(fromActionsNote.NoteActionTypes.noteUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.noteService.update(payload).pipe(
      switchMap((response: any) => this.success('UPDATED', response.description)),
      catchError((err: HttpErrorResponse) => of(new fromActionsNote.NoteFailure({ error: err.error })))
    ))
  ));

  delete$ = createEffect(() => this.actions.pipe(ofType(fromActionsNote.NoteActionTypes.noteDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.noteService.delete(payload.id).pipe(
      switchMap(() => this.success('DELETED', payload.description)),
      catchError((err: HttpErrorResponse) => of(new fromActionsNote.NoteFailure({ error: err.error })))
    ))
  ));

  complete$ = createEffect(() => this.actions.pipe(ofType(fromActionsNote.NoteActionTypes.noteComplete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.noteService.complete(payload).pipe(
      switchMap((response: any) => this.success('COMPLETED', response.description)),
      catchError((err: HttpErrorResponse) => of(new fromActionsNote.NoteFailure({ error: err.error })))
    ))
  ));

  getAllProfessional$ = createEffect(() => this.actions.pipe(ofType(fromActionsNote.NoteActionTypes.getAllProfessional)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllProfessionals().pipe(
      switchMap((response: any) => of(new fromActionsNote.NoteSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsNote.NoteFailure({ error: err.error })))
    ))
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsNote.NoteActionTypes.noteSelected),
    tap((data: any) => this.router.navigate([this.translate.currentLang, 'notes', data.payload.id]))
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsNote.NoteActionTypes.noteSuccess)
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsNote.NoteActionTypes.noteSaveSuccess)
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private noteService: NoteService, private router: Router, private userService: UserService) {
  }

  private success(key: string, description: string): Observable<NoteSaveSuccess> {
    const message = this.translate.instant(`NOTE.${ key }.MESSAGE`, { description });
    return of(new fromActionsNote.NoteSaveSuccess({ message }));
  }
}
