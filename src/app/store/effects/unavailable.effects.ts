import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  createBlockAgenda,
  createUnavailable,
  deleteUnavailable,
  getAllProfessional,
  getAllRoomsByProfessionalId,
  getUnavailable,
  getUnavailablePage,
  professionalSuccess,
  roomSuccess,
  unavailableFailure,
  unavailableSaveSuccess,
  unavailableSelected,
  unavailableSuccess,
  updateUnavailable,
} from '../unavailable.actions';
import { TranslateService } from '@ngx-translate/core';
import { UnavailableService } from '../../services/unavailable.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { newDateTimestamp } from '../../util/dates';
import { Pagination } from '../../interfaces/pagination';
import { IUnavailable, IUnavailableAll } from '../../interfaces/unavailable';
import { IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class UnavailableEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly unavailableService: UnavailableService = inject(UnavailableService);
  private readonly userService: UserService = inject(UserService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getUnavailablePage),
    switchMap(({ page, sort, direction, size }) =>
      this.unavailableService.getUnavailablePage(page, sort, direction, size).pipe(
        map((data: Pagination<IUnavailable>) => unavailableSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
      )),
  ));

  getAllProfessional$ = createEffect(() => this.actions.pipe(
    ofType(getAllProfessional),
    switchMap(() => this.userService.getProfessionals().pipe(
      map((professionals: IUserAll[]) => professionalSuccess({ professionals })),
      catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
    )),
  ));

  getRoom$ = createEffect(() => this.actions.pipe(
    ofType(getAllRoomsByProfessionalId),
    switchMap(({ professionalId }) => this.userService.getAllRoomsByProfessionalId(professionalId).pipe(
      map((rooms: IRoomAll[]) => roomSuccess({ rooms })),
      catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getUnavailable),
    switchMap(({ id }) => this.unavailableService.getUnavailable(id).pipe(
      map((selected?: IUnavailableAll) => unavailableSelected({ selected })),
      catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createUnavailable),
    switchMap(({ unavailable, isRoomAdmin }) => this.unavailableService.createUnavailable(unavailable).pipe(
      switchMap((response: IApiResponse) => this.requestSuccess('UNAVAILABLE.CREATED',
        newDateTimestamp(response.timestamp), isRoomAdmin ? 'dashboard/events' : `unavailable/${ response.id }`)),
      catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
    )),
  ));

  blockAgenda$ = createEffect(() => this.actions.pipe(
    ofType(createBlockAgenda),
    switchMap(({ unavailable, isRoomAdmin }) => this.unavailableService.createBlockAgenda(unavailable).pipe(
      switchMap((response: IApiResponse) => this.requestSuccess('UNAVAILABLE.CREATED',
        newDateTimestamp(response.timestamp), isRoomAdmin ? 'dashboard/events' : `unavailable/block-agenda/${ response.id }`)),
      catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateUnavailable),
    switchMap(({ id, unavailable, path }) => this.unavailableService.updateUnavailable(id, unavailable).pipe(
      switchMap((response: IApiResponse) => this.requestSuccess('UNAVAILABLE.UPDATED.MESSAGE',
        newDateTimestamp(response.timestamp), `${ path }/${ response.id }`)),
      catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteUnavailable),
    switchMap(({ id, timestamp, timeZone }) => this.unavailableService.deleteUnavailable(id).pipe(
      switchMap(() => this.requestSuccess('UNAVAILABLE.DELETED.MESSAGE', newDateTimestamp(timestamp, timeZone),
        undefined, 'warning')),
      catchError((err: HttpErrorResponse) => of(unavailableFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(unavailableSelected),
    tap(({ selected }) => {
      let path = [this.translate.currentLang, 'unavailable'];
      if (selected?.type === 'BLOCK_AGENDA') {
        path = [...path, 'block-agenda'];
      }
      this.router.navigate([...path, selected?.id]);
    }),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(unavailableSuccess),
  ), { dispatch: false });

  roomSuccess$ = createEffect(() => this.actions.pipe(
    ofType(roomSuccess),
  ), { dispatch: false });

  professionalSuccess$ = createEffect(() => this.actions.pipe(
    ofType(professionalSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(unavailableSaveSuccess),
  ), { dispatch: false });

  private requestSuccess(key: string, date?: Date, path?: string, toastType?: ToastType) {
    const message = this.translate.instant(key, { date });
    return success(unavailableSaveSuccess, message, path, undefined, toastType);
  }
}
