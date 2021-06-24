import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsUnavailable from '../unavailable.actions';
import { TranslateService } from '@ngx-translate/core';
import { UnavailableService } from '../../services/unavailable.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Injectable()
export class UnavailableEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.unavailableService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsUnavailable.UnavailableSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllProfessional$ = this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.getAllProfessional)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllProfessionals().pipe(
      switchMap((response: any) => of(new fromActionsUnavailable.UnavailableSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({error: err.error})))
    ))
  );

  @Effect()
  getRoom$ = this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.getRoom)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getRoomByProfessionalId(payload).pipe(
      switchMap((response: any) => of(new fromActionsUnavailable.RoomSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({error: err.error})))
    ))
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.unavailableService.getById(payload).pipe(
      switchMap((unavailable: any) => of(new fromActionsUnavailable.UnavailableSelected(unavailable))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({error: err.error})))
    ))
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.unavailableService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('UNAVAILABLE.ADD.CREATED', {date: response.start});
        return of(new fromActionsUnavailable.UnavailableSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({error: err.error})))
    ))
  );

  @Effect()
  update = this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.unavailableService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('UNAVAILABLE.UPDATED.MESSAGE', {date: response.start});
        return of(new fromActionsUnavailable.UnavailableSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({error: err.error})))
    ))
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.unavailableService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('UNAVAILABLE.DELETED.MESSAGE', {date: response.start});
        return of(new fromActionsUnavailable.UnavailableSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUnavailable.UnavailableFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSelected),
    tap((data: any) => this.router.navigate(['unavailable', data.payload.id]))
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSuccess)
  );

  @Effect({dispatch: false})
  roomSuccess$ = this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.roomSuccess)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsUnavailable.UnavailableActionTypes.unavailableSaveSuccess),
    tap(() => this.router.navigate(['unavailable-list']))
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private unavailableService: UnavailableService,
              private userService: UserService, private router: Router) {
  }
}
