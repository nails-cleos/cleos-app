import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
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
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class OfficeEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly officeService: OfficeService = inject(OfficeService);
  private readonly userService: UserService = inject(UserService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getOfficesPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.officeService.getOfficesPage(page, sort, direction, size)
        .pipe(map((value: Pagination<IOfficeAll>) => officeSuccess({ data: { kind: 'pagination', value } }))),
      action => action,
      officeFailure,
    )),
  ));

  getAllManager$ = createEffect(() => this.actions.pipe(
    ofType(getAllManager),
    switchMap(() => effectRequest(
      this.userService.getManagers()
        .pipe(map((managers: IUserAll[]) => managerSuccess(managers ? { managers } : { managers: [] }))),
      action => action,
      officeFailure,
    )),
  ));

  findMyOffices$ = createEffect(() => this.actions.pipe(
    ofType(getAllMyOffices),
    switchMap(() => effectRequest(
      this.officeService.getAllMyOffices()
        .pipe(map((value: IOfficeAll[]) => officeSuccess({ data: { kind: 'list', value: value ?? [] } }))),
      action => action,
      officeFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getOffice),
    switchMap(({ id }) => effectRequest(
      this.officeService.getOffice(id).pipe(map((selected?: IOffice) => officeSelected({ selected }))),
      action => action,
      officeFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createOffice),
    switchMap(({ office }) => effectRequest(
      this.officeService.createOffice(office).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('OFFICE.CREATED', { name: response.name });
        const path = `offices/${ response.id }`;
        return successResponse(officeSaveSuccess, message, path, 'offices');
      })),
      action => action,
      officeFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateOffice),
    switchMap(({ id, office }) => effectRequest(
      this.officeService.updateOffice(id, office).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('OFFICE.UPDATED.MESSAGE', { name: response.name });
        const path = `offices/${ response.id }`;
        return successResponse(officeSaveSuccess, message, path, 'offices');
      })),
      action => action,
      officeFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteOffice),
    switchMap(({ id, name }) => effectRequest(
      this.officeService.deleteOffice(id).pipe(switchMap(() => {
        const message = this.translate.instant('OFFICE.DELETED.MESSAGE', { name });
        return successResponse(officeSaveSuccess, message, undefined, 'offices', true, 'warning');
      })),
      action => action,
      officeFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(officeSelected),
    tap(({ selected }) => this.router
      .navigate([this.translate.getCurrentLang(), 'offices', selected?.id])),
  ), { dispatch: false });
}
