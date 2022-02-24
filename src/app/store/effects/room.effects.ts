import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsRoom from '../room.actions';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../services/room.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Injectable()
export class RoomEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsRoom.RoomSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  getMyRoom$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.getMyRoom)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.roomService.getMyRoom().pipe(
      switchMap((room: any) => of(new fromActionsRoom.RoomSelected({room}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  getMyRoomService$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.getMyService)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.roomService.getMyService().pipe(
      switchMap((room: any) => of(new fromActionsRoom.RoomServiceSelected(room))),
      catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));


  getAllProfessional$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.getAllProfessional)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllProfessionals().pipe(
      switchMap((response: any) => of(new fromActionsRoom.RoomSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.roomFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.getById(payload).pipe(
      switchMap((room: any) => of(new fromActionsRoom.RoomSelected({room, redirect: true}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.roomSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('ROOM.CREATED', {name: response.name});
        return of(new fromActionsRoom.RoomSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  update$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.roomUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('ROOM.UPDATED.MESSAGE', {name: response.name});
        return of(new fromActionsRoom.RoomSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  updateServices$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.roomServiceUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.updateService(payload).pipe(
      switchMap(() => of(new fromActionsRoom.RoomSaveSuccess({message: this.translate.instant('ROOM.ME.SERVICES.UPDATE.MESSAGE')}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsRoom.RoomActionTypes.roomDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('ROOM.DELETED.MESSAGE', {name: response.name});
        return of(new fromActionsRoom.RoomSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsRoom.RoomFailure({error: err.error})))
    ))
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsRoom.RoomActionTypes.roomSelected),
    tap((data: any) => {
      if (data.payload.redirect) {
        this.router.navigate(['rooms', data.payload.room.id]);
      }
    })
  ), {dispatch: false});

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsRoom.RoomActionTypes.roomSuccess)
  ), {dispatch: false});

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsRoom.RoomActionTypes.roomSaveSuccess)
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions, private roomService: RoomService,
              private userService: UserService, private router: Router) {
  }
}
