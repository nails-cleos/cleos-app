import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsRoom from '../room.actions';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../services/room.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Injectable()
export class RoomEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.GET_ALL)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.roomService.getAll(payload.active, payload.direction, payload.page).pipe(
        switchMap((response: any) => {
          return of(new fromActionsRoom.RoomSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getMyRoom$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.GET_MY_ROOM)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.roomService.getMyRoom().pipe(
        switchMap((room: any) => {
          return of(new fromActionsRoom.RoomSelected({room}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect()
  getAllProfessional$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.GET_ALL_PROFESSIONAL)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.userService.getAllProfessionals().pipe(
        switchMap((response: any) => {
          return of(new fromActionsRoom.RoomSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.ROOM_FIND)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.roomService.getById(payload).pipe(
        switchMap((room: any) => {
          return of(new fromActionsRoom.RoomSelected({room, redirect: true}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.ROOM_SAVE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.roomService.add(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('ROOM.ADD.CREATED', {name: response.name});
          return of(new fromActionsRoom.RoomSaveSuccess({message, redirect: true}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect()
  update$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.ROOM_UPDATE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.roomService.update(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('ROOM.UPDATED.MESSAGE', {name: response.name});
          return of(new fromActionsRoom.RoomSaveSuccess({message, redirect: true}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect()
  updateMe$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.ROOM_UPDATE_ME)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.roomService.update(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('ROOM.UPDATED.MESSAGE', {name: response.name});
          return of(new fromActionsRoom.RoomSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.ROOM_DELETE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.roomService.delete(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('ROOM.DELETED.MESSAGE', {name: response.name});
          return of(new fromActionsRoom.RoomSaveSuccess({message, redirect: true}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsRoom.RoomActionTypes.ROOM_SELECTED),
    tap((data: any) => {
      if (data.payload.redirect) {
        this.router.navigate(['room', data.payload.room.id]);
      }
    })
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsRoom.RoomActionTypes.ROOM_SUCCESS)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsRoom.RoomActionTypes.ROOM_SAVE_SUCCESS),
    tap((data: any) => {
      if (data.payload.redirect) {
        this.router.navigate(['rooms']);
      }
    })
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private roomService: RoomService,
              private userService: UserService, private router: Router) {
  }
}
