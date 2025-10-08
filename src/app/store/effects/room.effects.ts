import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CreateRoom,
  CustomerInfoSuccess,
  DeleteRoom,
  GetRoom,
  GetAllCustomersInfo,
  GetRoomsPage,
  GetServices,
  RoomActionTypes,
  RoomFailure,
  RoomInfoSuccess,
  RoomSaveSuccess,
  RoomSelected,
  RoomServiceSelected,
  RoomSuccess,
  UpdateRoom,
  UpdateServices,
} from '../room.actions';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../services/room.service';
import { Router } from '@angular/router';
import { roomName } from '../../util/helper';
import { Pagination } from '../../interfaces/pagination';
import { IRoom, IRoomCustomer, IRoomInfo, IRoomService } from '../../interfaces/room';
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class RoomEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.getRoomsPage),
    switchMap((action: GetRoomsPage) =>
      this.roomService.getRoomsPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((response: Pagination<IRoom>) => of(new RoomSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  getMyRoomService$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.getServices),
    switchMap((action: GetServices) =>
      this.roomService.getServices(action.id).pipe(
        switchMap((response: IRoomService) => of(new RoomServiceSelected(response))),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  getRoomInfo$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.getAllRoomsInfo),
    switchMap(() =>
      this.roomService.getAllRoomsInfo().pipe(
        switchMap((response: IRoomInfo) => of(new RoomInfoSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.getRoom),
    switchMap((action: GetRoom) =>
      this.roomService.getRoom(action.id).pipe(
        switchMap((response?: IRoom) => of(new RoomSelected(response, action.redirect))),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.createRoom),
    switchMap((action: CreateRoom) =>
      this.roomService.createRoom(action.room).pipe(
        switchMap((response: IApiResponse) => this.requestSuccess('ROOM.CREATED', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.updateRoom),
    switchMap((action: UpdateRoom) =>
      this.roomService.updateRoom(action.id, action.room).pipe(
        switchMap((response: IApiResponse) => this.requestSuccess('ROOM.UPDATED.MESSAGE', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  updateServices$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.updateServices),
    switchMap((action: UpdateServices) =>
      this.roomService.updateServices(action.id, action.prices).pipe(
        switchMap(() => this.requestSuccess('ROOM.ME.SERVICES.UPDATE.MESSAGE')),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.deleteRoom),
    switchMap((action: DeleteRoom) =>
      this.roomService.deleteRoom(action.id).pipe(
        switchMap(() => this.requestSuccess('ROOM.DELETED.MESSAGE', roomName(action.room), undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  getCustomerInfo$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.getAllCustomersInfo),
    switchMap((action: GetAllCustomersInfo) =>
      this.roomService.getAllCustomersInfo(action.id).pipe(
        switchMap((response: IRoomCustomer[]) => of(new CustomerInfoSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new RoomFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.roomSelected),
    tap((data: RoomSelected) => {
      if (data.redirect) {
        this.router.navigate([this.translate.currentLang, 'rooms', data.selected?.id]);
      }
    }),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.roomSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(RoomActionTypes.roomSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private roomService: RoomService,
              private router: Router) {
  }

  private requestSuccess(key: string, name?: string, id?: string, toastType?: ToastType): Observable<RoomSaveSuccess> {
    const message = this.translate.instant(key, { name });
    const path = id ? `rooms/${ id }` : undefined;
    return success(RoomSaveSuccess, message, path, undefined, toastType);
  }
}
