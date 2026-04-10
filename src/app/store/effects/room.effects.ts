import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
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
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class RoomEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly roomService: RoomService = inject(RoomService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getRoomsPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.roomService.getRoomsPage(page, sort, direction, size).pipe(map((data: Pagination<IRoom>) =>
        roomSuccess({ data }))),
      action => action,
      roomFailure,
    )),
  ));

  getMyRoomService$ = createEffect(() => this.actions.pipe(
    ofType(getServices),
    switchMap(({ id }) => effectRequest(
      this.roomService.getServices(id).pipe(map((services: IRoomService) =>
        roomServiceSelected({ services }))),
      action => action,
      roomFailure,
    )),
  ));

  getRoomInfo$ = createEffect(() => this.actions.pipe(
    ofType(getAllRoomsInfo),
    switchMap(() => effectRequest(
      this.roomService.getAllRoomsInfo()
        .pipe(map((roomInfo: IRoomInfo) => roomInfoSuccess({ roomInfo }))),
      action => action,
      roomFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getRoom),
    switchMap(({ id, redirect }) => effectRequest(
      this.roomService.getRoom(id)
        .pipe(map((selected?: IRoom) => roomSelected({ selected, redirect }))),
      action => action,
      roomFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createRoom),
    switchMap(({ room }) => effectRequest(
      this.roomService.createRoom(room).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('ROOM.CREATED', { name: response.name });
        const path = `rooms/${ response.id }`;
        return successResponse(roomSaveSuccess, message, path, 'rooms');
      })),
      action => action,
      roomFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateRoom),
    switchMap(({ id, room }) => effectRequest(
      this.roomService.updateRoom(id, room).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('ROOM.UPDATED.MESSAGE', { name: response.name });
        const path = `rooms/${ response.id }`;
        return successResponse(roomSaveSuccess, message, path, 'rooms');
      })),
      action => action,
      roomFailure,
    )),
  ));

  updateServices$ = createEffect(() => this.actions.pipe(
    ofType(updateServices),
    switchMap(({ id, prices }) => effectRequest(
      this.roomService.updateServices(id, prices).pipe(switchMap(() =>
        success(roomSaveSuccess, 'ROOM.ME.SERVICES.UPDATE.MESSAGE'))),
      action => action,
      roomFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteRoom),
    switchMap(({ id, room }) => effectRequest(
      this.roomService.deleteRoom(id).pipe(switchMap(() => {
        const message = this.translate.instant('ROOM.DELETED.MESSAGE', { name: roomName(room) });
        return success(roomSaveSuccess, message, undefined, true, 'warning');
      })),
      action => action,
      roomFailure,
    )),
  ));

  getCustomerInfo$ = createEffect(() => this.actions.pipe(
    ofType(getAllCustomersInfo),
    switchMap(({ id }) => effectRequest(
      this.roomService.getAllCustomersInfo(id).pipe(map((customers: IRoomCustomer[]) =>
        customerInfoSuccess({ customers }))),
      action => action,
      roomFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(roomSelected),
    tap(({ selected, redirect }) => {
      if (redirect) {
        this.router.navigate([this.translate.getCurrentLang(), 'rooms', selected?.id]);
      }
    }),
  ), { dispatch: false });
}
