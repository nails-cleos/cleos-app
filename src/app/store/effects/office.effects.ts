import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { OfficeService } from '../../services/office.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Pagination } from '../../interfaces/pagination';
import {
  CreateOffice,
  DeleteOffice,
  GetOffice,
  GetOfficesPage,
  ManagerSuccess,
  OfficeActionTypes,
  OfficeFailure,
  OfficeSaveSuccess,
  OfficeSelected,
  OfficeSuccess,
  UpdateOffice,
} from '../office.actions';
import { IOffice } from '../../interfaces/office';
import { IUser } from '../../interfaces/user';
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class OfficeEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.getOfficesPage),
    switchMap((action: GetOfficesPage) =>
      this.officeService.getOfficesPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((response: Pagination<IOffice>) => of(new OfficeSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new OfficeFailure(err.error))),
      )),
  ));

  getAllManager$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.getAllManager),
    switchMap(() =>
      this.userService.getManagers().pipe(
        switchMap((response: IUser[]) => of(new ManagerSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new OfficeFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.getOffice),
    switchMap((action: GetOffice) =>
      this.officeService.getOffice(action.id).pipe(
        switchMap((response?: IOffice) => of(new OfficeSelected(response))),
        catchError((err: HttpErrorResponse) => of(new OfficeFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.createOffice),
    switchMap((action: CreateOffice) =>
      this.officeService.createOffice(action.office).pipe(
        switchMap((response: IApiResponse) => this.requestSuccess('OFFICE.CREATED', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new OfficeFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.updateOffice),
    switchMap((action: UpdateOffice) =>
      this.officeService.updateOffice(action.id, action.office).pipe(
        switchMap(
          (response: IApiResponse) => this.requestSuccess('OFFICE.UPDATED.MESSAGE', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new OfficeFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.deleteOffice),
    switchMap((action: DeleteOffice) =>
      this.officeService.deleteOffice(action.id).pipe(
        switchMap(() => this.requestSuccess('OFFICE.DELETED.MESSAGE', action.name, undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(new OfficeFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.officeSelected),
    tap((data: OfficeSelected) => this.router
      .navigate([this.translate.currentLang, 'offices', data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.officeSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(OfficeActionTypes.officeSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private officeService: OfficeService, private userService: UserService, private router: Router) {
  }

  private requestSuccess(key: string, name?: string, id?: string,
    toastType?: ToastType): Observable<OfficeSaveSuccess> {
    const message = this.translate.instant(key, { name });
    const path = id ? `offices/${ id }` : undefined;
    return success(OfficeSaveSuccess, message, path, undefined, toastType);
  }
}
