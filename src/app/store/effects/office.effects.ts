import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsOffice from '../office.actions';
import { TranslateService } from '@ngx-translate/core';
import { OfficeService } from '../../services/office.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Injectable()
export class OfficeEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsOffice.OfficeActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.officeService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsOffice.OfficeSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsOffice.OfficeFailure({error: err.error})))
    ))
  ));

  getAllManager$ = createEffect(() => this.actions$.pipe(ofType(fromActionsOffice.OfficeActionTypes.getAllManager)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllManagers().pipe(
      switchMap((response: any) => of(new fromActionsOffice.OfficeSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsOffice.OfficeFailure({error: err.error})))
    ))
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsOffice.OfficeActionTypes.officeFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.officeService.getById(payload).pipe(
      switchMap((office: any) => of(new fromActionsOffice.OfficeSelected({office}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsOffice.OfficeFailure({error: err.error})))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsOffice.OfficeActionTypes.officeSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.officeService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('OFFICE.CREATED', {name: response.name});
        return of(new fromActionsOffice.OfficeSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsOffice.OfficeFailure({error: err.error})))
    ))
  ));

  update = createEffect(() => this.actions$.pipe(ofType(fromActionsOffice.OfficeActionTypes.officeUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.officeService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('OFFICE.UPDATED.MESSAGE', {name: response.name});
        return of(new fromActionsOffice.OfficeSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsOffice.OfficeFailure({error: err.error})))
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsOffice.OfficeActionTypes.officeDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.officeService.delete(payload.id).pipe(
      switchMap(() => {
        const message = this.translate.instant('OFFICE.DELETED.MESSAGE', {name: payload.name});
        return of(new fromActionsOffice.OfficeSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsOffice.OfficeFailure({error: err.error})))
    ))
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsOffice.OfficeActionTypes.officeSelected),
    tap((data: any) => this.router.navigate([this.translate.currentLang, 'offices', data.payload.office.id]))
  ), {dispatch: false});

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsOffice.OfficeActionTypes.officeSuccess)
  ), {dispatch: false});

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsOffice.OfficeActionTypes.officeSaveSuccess)
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private officeService: OfficeService, private userService: UserService, private router: Router) {
  }
}
