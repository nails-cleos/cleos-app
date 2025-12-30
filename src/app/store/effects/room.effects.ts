import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  createRoom,
  customerInfoSuccess,
  deleteRoom,
  getAllCustomersInfo,
  getAllRoomsInfo,
  getRoom,
  getRoomsPage,
  getServices,
  roomFailure,
  roomInfoSuccess,
  roomSaveSuccess,
  roomSelected,
  roomServiceSelected,
  roomSuccess,
  updateRoom,
  updateServices,
} from '../room.actions';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../services/room.service';
import { Router } from '@angular/router';
import { roomName } from '../../util/helper';
import { Pagination } from '../../interfaces/pagination';
import { IRoom, IRoomCustomer, IRoomInfo, IRoomService } from '../../interfaces/room';
import { IApiResponse, success, successResponse } from '../../interfaces/common';

@Injectable()
export class RoomEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly roomService: RoomService = inject(RoomService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getRoomsPage),
    switchMap(({ page, sort, direction, size }) =>
      this.roomService.getRoomsPage(page, sort, direction, size).pipe(
        map((data: Pagination<IRoom>) => roomSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
      )),
  ));

  getMyRoomService$ = createEffect(() => this.actions.pipe(
    ofType(getServices),
    switchMap(({ id }) => this.roomService.getServices(id).pipe(
      map((services: IRoomService) => roomServiceSelected({ services })),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  getRoomInfo$ = createEffect(() => this.actions.pipe(
    ofType(getAllRoomsInfo),
    switchMap(() => this.roomService.getAllRoomsInfo().pipe(
      map((roomInfo: IRoomInfo) => roomInfoSuccess({ roomInfo })),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getRoom),
    switchMap(({ id, redirect }) => this.roomService.getRoom(id).pipe(
      map((selected?: IRoom) => roomSelected({ selected, redirect })),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createRoom),
    switchMap(({ room }) => this.roomService.createRoom(room).pipe(
      switchMap((response: IApiResponse) => {
        const message = this.translate.instant('ROOM.CREATED', { name: response.name });
        const path = `rooms/${response.id}`;
        return successResponse(roomSaveSuccess, message, path, 'rooms');
      }),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateRoom),
    switchMap(({ id, room }) => this.roomService.updateRoom(id, room).pipe(
      switchMap((response: IApiResponse) => {
        const message = this.translate.instant('ROOM.UPDATED.MESSAGE', { name: response.name });
        const path = `rooms/${response.id}`;
        return successResponse(roomSaveSuccess, message, path, 'rooms');
      }),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  updateServices$ = createEffect(() => this.actions.pipe(
    ofType(updateServices),
    switchMap(({ id, prices }) => this.roomService.updateServices(id, prices).pipe(
      switchMap(() => {
        const message = this.translate.instant('ROOM.ME.SERVICES.UPDATE.MESSAGE');
        return success(roomSaveSuccess, message);
      }),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteRoom),
    switchMap(({ id, room }) => this.roomService.deleteRoom(id).pipe(
      switchMap(() => {
        const message = this.translate.instant('ROOM.DELETED.MESSAGE', { name: roomName(room) });
        return success(roomSaveSuccess, message, undefined, false, 'warning');
      }),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  getCustomerInfo$ = createEffect(() => this.actions.pipe(
    ofType(getAllCustomersInfo),
    switchMap(({ id }) => this.roomService.getAllCustomersInfo(id).pipe(
      map((customers: IRoomCustomer[]) => customerInfoSuccess({ customers })),
      catchError((err: HttpErrorResponse) => of(roomFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(roomSelected),
    tap(({ selected, redirect }) => {
      if (redirect) {
        this.router.navigate([this.translate.currentLang, 'rooms', selected?.id]);
      }
    }),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(roomSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(roomSaveSuccess),
  ), { dispatch: false });
}
