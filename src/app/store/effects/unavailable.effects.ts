import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
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
  updateUnavailable } from '../actions/unavailable.actions';
import { TranslateService } from '@ngx-translate/core';
import { UnavailableService } from '../../services/unavailable.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { newDateTimestamp } from '../../util/dates';
import { Pagination } from '../../interfaces/pagination';
import { IUnavailableAll } from '../../interfaces/unavailable';
import { IUserAll } from '../../interfaces/user';
import { IRoomAll } from '../../interfaces/room';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class UnavailableEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly unavailableService: UnavailableService = inject(UnavailableService);
  private readonly userService: UserService = inject(UserService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getUnavailablePage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.unavailableService.getUnavailablePage(page, sort, direction, size)
        .pipe(map((data: Pagination<IUnavailableAll>) => unavailableSuccess({ data }))),
      action => action,
      unavailableFailure,
    )),
  ));

  getAllProfessional$ = createEffect(() => this.actions.pipe(
    ofType(getAllProfessional),
    switchMap(() => effectRequest(
      this.userService.getProfessionals().pipe(map((professionals: IUserAll[]) =>
        professionalSuccess({ professionals }))),
      action => action,
      unavailableFailure,
    )),
  ));

  getRoom$ = createEffect(() => this.actions.pipe(
    ofType(getAllRoomsByProfessionalId),
    switchMap(({ professionalId }) => effectRequest(
      this.userService.getAllRoomsByProfessionalId(professionalId).pipe(map((rooms: IRoomAll[]) =>
        roomSuccess({ rooms }))),
      action => action,
      unavailableFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getUnavailable),
    switchMap(({ id }) => effectRequest(
      this.unavailableService.getUnavailable(id).pipe(map((selected?: IUnavailableAll) =>
        unavailableSelected({ selected }))),
      action => action,
      unavailableFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createUnavailable),
    switchMap(({ unavailable, isRoomAdmin }) => effectRequest(
      this.unavailableService.createUnavailable(unavailable).pipe(switchMap((response: IApiResponse) => this.requestSuccess('UNAVAILABLE.CREATED',
        newDateTimestamp(response.timestamp), isRoomAdmin ? 'dashboard/events' : `unavailable/${response.id}`))),
      action => action,
      unavailableFailure,
    )),
  ));

  blockAgenda$ = createEffect(() => this.actions.pipe(
    ofType(createBlockAgenda),
    switchMap(({ unavailable, isRoomAdmin }) => effectRequest(
      this.unavailableService.createBlockAgenda(unavailable).pipe(switchMap((response: IApiResponse) => this.requestSuccess('UNAVAILABLE.CREATED',
        newDateTimestamp(response.timestamp),
        isRoomAdmin ? 'dashboard/events' : `unavailable/block-agenda/${response.id}`))),
      action => action,
      unavailableFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateUnavailable),
    switchMap(({ id, unavailable, path }) => effectRequest(
      this.unavailableService.updateUnavailable(id, unavailable).pipe(switchMap((response: IApiResponse) => this.requestSuccess('UNAVAILABLE.UPDATED.MESSAGE',
        newDateTimestamp(response.timestamp), `${path}/${response.id}`))),
      action => action,
      unavailableFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteUnavailable),
    switchMap(({ id, timestamp, timeZone }) => effectRequest(
      this.unavailableService.deleteUnavailable(id).pipe(switchMap(() => {
        const message = this.translate.instant('UNAVAILABLE.DELETED.MESSAGE',
          { date: newDateTimestamp(timestamp, timeZone) });
        return success(unavailableSaveSuccess, message, undefined, true, 'warning');
      })),
      action => action,
      unavailableFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(unavailableSelected),
    tap(({ selected }) => {
      let path = [this.translate.getCurrentLang(), 'unavailable'];
      if (selected?.type === 'BLOCK_AGENDA') {
        path = [...path, 'block-agenda'];
      }
      this.router.navigate([...path, selected?.id]);
    }),
  ), { dispatch: false });

  private requestSuccess(key: string, date: Date, path: string) {
    const message = this.translate.instant(key, { date });
    return successResponse(unavailableSaveSuccess, message, path, 'unavailable');
  }
}
