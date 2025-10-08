import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  AdditionalActionTypes,
  AdditionalFailure,
  AdditionalSaveSuccess,
  AdditionalSelected,
  AdditionalSuccess,
  CreateAdditional,
  DeleteAdditional,
  GetAdditional,
  FindGroupsSuccess,
  GetAdditionalPage,
  SortAdditional,
  UpdateAdditional,
} from '../additional.actions';
import { TranslateService } from '@ngx-translate/core';
import { AdditionalService } from '../../services/additional.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IAdditional, IAdditionalAll } from '../../interfaces/additional';
import { IApiResponse, success } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';

@Injectable()
export class AdditionalEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.getAdditionalPage),
    switchMap((action: GetAdditionalPage) =>
      this.additionalService.getAdditionalPage(action.sort, action.direction, action.page, action.size).pipe(
        switchMap((response: Pagination<IAdditional>) => of(new AdditionalSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  findAdditionalList$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.getAdditionalList),
    switchMap(() =>
      this.additionalService.getAdditionalList().pipe(
        switchMap((response: IAdditionalAll[]) => of(new AdditionalSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.getAdditional),
    switchMap((action: GetAdditional) =>
      this.additionalService.getAdditional(action.id).pipe(
        switchMap((additional?: IAdditional) => of(new AdditionalSelected(additional))),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.createAdditional),
    switchMap((action: CreateAdditional) =>
      this.additionalService.createAdditional(action.additional).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('ADDITIONAL.CREATED', { name: response.name });
          const path = `additional/${ response.id }`;
          return success(AdditionalSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.updateAdditional),
    switchMap((action: UpdateAdditional) =>
      this.additionalService.updateAdditional(action.id, action.additional).pipe(
        switchMap((response: IAdditional) => {
          const message = this.translate.instant('ADDITIONAL.UPDATED.MESSAGE', { name: response.name });
          const path = `additional/${ response.id }`;
          return success(AdditionalSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  updateSort$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.sortAdditional),
    switchMap((action: SortAdditional) =>
      this.additionalService.sortAdditional(action.additionalList).pipe(
        switchMap(() => success(AdditionalSaveSuccess, this.translate.instant('ADDITIONAL.SORTED.MESSAGE'))),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.deleteAdditional),
    switchMap((action: DeleteAdditional) =>
      this.additionalService.deleteAdditional(action.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('ADDITIONAL.DELETED.MESSAGE', { name: action.name });
          return success(AdditionalSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.getAllTreatmentsGroup),
    switchMap(() =>
      this.treatmentService.getAllTreatmentsGroup().pipe(
        switchMap((response: ITreatmentGroup[]) => of(new FindGroupsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new AdditionalFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.additionalSelected),
    tap((data: AdditionalSelected) => this.router.navigate(
      [this.translate.currentLang, 'additional', data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.additionalSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(AdditionalActionTypes.additionalSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private additionalService: AdditionalService, private treatmentService: TreatmentService,
              private router: Router) {
  }
}
