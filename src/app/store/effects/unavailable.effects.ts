import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CreateBlockAgenda,
  CreateUnavailable,
  DeleteUnavailable,
  GetUnavailable,
  GetAllRoomsByProfessionalId,
  GetUnavailablePage,
  ProfessionalSuccess,
  RoomSuccess,
  UnavailableActionTypes,
  UnavailableFailure,
  UnavailableSaveSuccess,
  UnavailableSelected,
  UnavailableSuccess,
  UpdateUnavailable,
} from '../unavailable.actions';
import { TranslateService } from '@ngx-translate/core';
import { UnavailableService } from '../../services/unavailable.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { newDateTimestamp } from '../../util/dates';
import { Pagination } from '../../interfaces/pagination';
import { IUnavailable } from '../../interfaces/unavailable';
import { IUser } from '../../interfaces/user';
import { IRoom } from '../../interfaces/room';
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class UnavailableEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.getUnavailablePage),
    switchMap((action: GetUnavailablePage) =>
      this.unavailableService.getUnavailablePage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((response: Pagination<IUnavailable>) => of(new UnavailableSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  getAllProfessional$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.getAllProfessional),
    switchMap(() =>
      this.userService.getProfessionals().pipe(
        switchMap((response: IUser[]) => of(new ProfessionalSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  getRoom$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.getAllRoomsByProfessionalId),
    switchMap((action: GetAllRoomsByProfessionalId) =>
      this.userService.getAllRoomsByProfessionalId(action.professionalId).pipe(
        switchMap((response: IRoom[]) => of(new RoomSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.getUnavailable),
    switchMap((action: GetUnavailable) =>
      this.unavailableService.getUnavailable(action.id).pipe(
        switchMap((response?: IUnavailable) => of(new UnavailableSelected(response))),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.createUnavailable),
    switchMap((action: CreateUnavailable) =>
      this.unavailableService.createUnavailable(action.unavailable).pipe(
        switchMap((response: IApiResponse) =>
          this.requestSuccess('UNAVAILABLE.CREATED', newDateTimestamp(response.timestamp),
            `unavailable/${ response.id }`)),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  blockAgenda$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.createBlockAgenda),
    switchMap((action: CreateBlockAgenda) =>
      this.unavailableService.createBlockAgenda(action.unavailable).pipe(
        switchMap((response: IApiResponse) =>
          this.requestSuccess('UNAVAILABLE.CREATED', newDateTimestamp(response.timestamp),
            `unavailable/block-agenda/${ response.id }`)),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.updateUnavailable),
    switchMap((action: UpdateUnavailable) =>
      this.unavailableService.updateUnavailable(action.id, action.unavailable).pipe(
        switchMap((response: IApiResponse) =>
          this.requestSuccess('UNAVAILABLE.UPDATED.MESSAGE', newDateTimestamp(response.timestamp),
            `${ action.path }/${ response.id }`)),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.deleteUnavailable),
    switchMap((action: DeleteUnavailable) =>
      this.unavailableService.deleteUnavailable(action.id).pipe(
        switchMap(() =>
          this.requestSuccess('UNAVAILABLE.DELETED.MESSAGE', newDateTimestamp(action.timestamp, action.timeZone),
            undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(new UnavailableFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.unavailableSelected),
    tap((data: UnavailableSelected) => {
      let path = [this.translate.currentLang, 'unavailable'];
      if (data.selected?.type === 'BLOCK_AGENDA') {
        path = [...path, 'block-agenda'];
      }
      this.router.navigate([...path, data.selected?.id]);
    }),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.unavailableSuccess),
  ), { dispatch: false });

  roomSuccess$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.roomSuccess),
  ), { dispatch: false });

  professionalSuccess$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.professionalSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(UnavailableActionTypes.unavailableSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private unavailableService: UnavailableService,
              private userService: UserService, private router: Router) {
  }

  private requestSuccess(key: string, date?: Date, path?: string,
    toastType?: ToastType): Observable<UnavailableSaveSuccess> {
    const message = this.translate.instant(key, { date });
    return success(UnavailableSaveSuccess, message, path, undefined, toastType);
  }
}
