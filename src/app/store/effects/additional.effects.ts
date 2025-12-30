import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  additionalFailure,
  additionalSaveSuccess,
  additionalSelected,
  additionalSuccess,
  createAdditional,
  deleteAdditional,
  findGroupsSuccess,
  getAdditional,
  getAdditionalList,
  getAdditionalPage,
  getAllTreatmentsGroup,
  sortAdditional,
  updateAdditional,
} from '../additional.actions';
import { TranslateService } from '@ngx-translate/core';
import { AdditionalService } from '../../services/additional.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';
import { IAdditional, IAdditionalAll } from '../../interfaces/additional';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';

@Injectable()
export class AdditionalEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly additionalService: AdditionalService = inject(AdditionalService);
  private readonly treatmentService: TreatmentService = inject(TreatmentService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getAdditionalPage),
    switchMap(({ sort, direction, page, size }) =>
      this.additionalService.getAdditionalPage(sort, direction, page, size).pipe(
        map((data: Pagination<IAdditional>) => additionalSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  findAdditionalList$ = createEffect(() => this.actions.pipe(
    ofType(getAdditionalList),
    switchMap(() =>
      this.additionalService.getAdditionalList().pipe(
        map((data: IAdditionalAll[]) => additionalSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getAdditional),
    switchMap(({ id }) =>
      this.additionalService.getAdditional(id).pipe(
        map((selected?: IAdditional) => additionalSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createAdditional),
    switchMap(({ additional }) =>
      this.additionalService.createAdditional(additional).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('ADDITIONAL.CREATED', { name: response.name });
          const path = `additional/${response.id}`;
          return successResponse(additionalSaveSuccess, message, path, 'additional');
        }),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateAdditional),
    switchMap(({ id, additional }) =>
      this.additionalService.updateAdditional(id, additional).pipe(
        switchMap((response: IAdditional) => {
          const message = this.translate.instant('ADDITIONAL.UPDATED.MESSAGE', { name: response.name });
          const path = `additional/${response.id}`;
          return successResponse(additionalSaveSuccess, message, path, 'additional');
        }),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  updateSort$ = createEffect(() => this.actions.pipe(
    ofType(sortAdditional),
    switchMap(({ additionalList }) =>
      this.additionalService.sortAdditional(additionalList).pipe(
        switchMap(() => success(additionalSaveSuccess, this.translate.instant('ADDITIONAL.SORTED.MESSAGE'))),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteAdditional),
    switchMap(({ id, name }) =>
      this.additionalService.deleteAdditional(id).pipe(
        switchMap(() => {
          const message = this.translate.instant('ADDITIONAL.DELETED.MESSAGE', { name });
          return success(additionalSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsGroup),
    switchMap(() =>
      this.treatmentService.getAllTreatmentsGroup().pipe(
        map((groups) => findGroupsSuccess({ groups })),
        catchError((err: HttpErrorResponse) => of(additionalFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(additionalSelected),
    tap(({ selected }) => this.router.navigate(
      [this.translate.currentLang, 'additional', selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(additionalSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(additionalSaveSuccess),
  ), { dispatch: false });
}
