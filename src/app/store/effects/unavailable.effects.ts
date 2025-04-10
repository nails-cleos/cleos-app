import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsUnavailable from '../unavailable.actions';
import { TranslateService } from '@ngx-translate/core';
import { UnavailableService } from '../../services/unavailable.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { newDateTimestamp } from '../../util/dates';

@Injectable()
export class UnavailableEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.unavailableService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsUnavailable.UnavailableSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
    )),
  ));

  getAllProfessional$ = createEffect(() =>
    this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.getAllProfessional)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.userService.getAllProfessionals().pipe(
        switchMap((response: any) => of(new fromActionsUnavailable.UnavailableSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
      )),
    ));

  getRoom$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.getRoom)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getRoomByProfessionalId(payload).pipe(
      switchMap((response: any) => of(new fromActionsUnavailable.RoomSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
    )),
  ));

  findOne$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableFind)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.unavailableService.getById(payload).pipe(
        switchMap((unavailable: any) => of(new fromActionsUnavailable.UnavailableSelected(unavailable))),
        catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
      )),
    ));

  save$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSave)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.unavailableService.add(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('UNAVAILABLE.CREATED', { date: newDateTimestamp(response.timestamp) });
          return of(new fromActionsUnavailable.UnavailableSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
      )),
    ));

  blockAgenda$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableBlockAgenda)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.unavailableService.blockAgenda(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('UNAVAILABLE.CREATED', { date: newDateTimestamp(response.timestamp) });
          return of(new fromActionsUnavailable.UnavailableSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
      )),
    ));

  update = createEffect(
    () => this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableUpdate)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.unavailableService.update(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('UNAVAILABLE.UPDATED.MESSAGE',
            { date: newDateTimestamp(response.timestamp) });
          return of(new fromActionsUnavailable.UnavailableSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
      )),
    ));

  delete$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableDelete)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.unavailableService.delete(payload.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('UNAVAILABLE.DELETED.MESSAGE',
            { date: newDateTimestamp(payload.timestamp) });
          return of(new fromActionsUnavailable.UnavailableSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({ error: err.error }))),
      )),
    ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSelected),
    tap((data: any) => {
      let path = [this.translate.currentLang, 'unavailable'];
      if (data.payload.type === 'BLOCK_AGENDA') {
        path = [...path, 'block-agenda'];
      }
      this.router.navigate([...path, data.payload.id]);
    }),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSuccess),
  ), { dispatch: false });

  roomSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.roomSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private unavailableService: UnavailableService,
              private userService: UserService, private router: Router) {
  }
}
