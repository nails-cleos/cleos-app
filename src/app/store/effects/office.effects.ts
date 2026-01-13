import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { OfficeService } from '../../services/office.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Pagination } from '../../interfaces/pagination';
import {
  createOffice,
  deleteOffice,
  getAllManager,
  getAllMyOffices,
  getOffice,
  getOfficesPage,
  managerSuccess,
  officeFailure,
  officeSaveSuccess,
  officeSelected,
  officeSuccess,
  updateOffice,
} from '../office.actions';
import { IOffice, IOfficeAll } from '../../interfaces/office';
import { IUserAll } from '../../interfaces/user';
import { IApiResponse, successResponse } from '../../interfaces/common';

@Injectable()
export class OfficeEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly officeService: OfficeService = inject(OfficeService);
  private readonly userService: UserService = inject(UserService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getOfficesPage),
    switchMap(({ page, sort, direction, size }) =>
      this.officeService.getOfficesPage(page, sort, direction, size).pipe(
        map((data: Pagination<IOffice>) => officeSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(officeFailure({ error: err.error }))),
      )),
  ));

  getAllManager$ = createEffect(() => this.actions.pipe(
    ofType(getAllManager),
    switchMap(() =>
      this.userService.getManagers().pipe(
        map((managers: IUserAll[]) => managerSuccess(managers ? { managers } : { managers: [] })),
        catchError((err: HttpErrorResponse) => of(officeFailure({ error: err.error }))),
      )),
  ));

  findMyOffices$ = createEffect(() => this.actions.pipe(
    ofType(getAllMyOffices),
    switchMap(() =>
      this.officeService.getAllMyOffices().pipe(
        map((data: IOfficeAll[]) => officeSuccess(data ? { data } : { data: [] })),
        catchError((err: HttpErrorResponse) => of(officeFailure({ error: err.error }))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getOffice),
    switchMap(({ id }) =>
      this.officeService.getOffice(id).pipe(
        map((selected?: IOffice) => officeSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(officeFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createOffice),
    switchMap(({ office }) =>
      this.officeService.createOffice(office).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('OFFICE.CREATED', { name: response.name });
          const path = `offices/${response.id}`;
          return successResponse(officeSaveSuccess, message, path, 'offices');
        }),
        catchError((err: HttpErrorResponse) => of(officeFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateOffice),
    switchMap(({ id, office }) =>
      this.officeService.updateOffice(id, office).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('OFFICE.UPDATED.MESSAGE', { name: response.name });
          const path = `offices/${response.id}`;
          return successResponse(officeSaveSuccess, message, path, 'offices');
        }),
        catchError((err: HttpErrorResponse) => of(officeFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteOffice),
    switchMap(({ id, name }) =>
      this.officeService.deleteOffice(id).pipe(
        switchMap(() => {
          const message = this.translate.instant('OFFICE.DELETED.MESSAGE', { name });
          return successResponse(officeSaveSuccess, message, undefined, 'offices', false, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(officeFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(officeSelected),
    tap(({ selected }) => this.router
      .navigate([this.translate.getCurrentLang(), 'offices', selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(officeSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(officeSaveSuccess),
  ), { dispatch: false });
}
