import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
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
} from '../actions/additional.actions';
import { TranslateService } from '@ngx-translate/core';
import { AdditionalService } from '../../services/additional.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';
import { IAdditional, IAdditionalAll } from '../../interfaces/additional';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class AdditionalEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly additionalService: AdditionalService = inject(AdditionalService);
  private readonly treatmentService: TreatmentService = inject(TreatmentService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getAdditionalPage),
    switchMap(({ sort, direction, page, size }) => effectRequest(
      this.additionalService.getAdditionalPage(sort, direction, page, size)
        .pipe(map((value: Pagination<IAdditionalAll>) => additionalSuccess({ data: { kind: 'pagination', value } }))),
      action => action,
      additionalFailure,
    )),
  ));

  findAdditionalList$ = createEffect(() => this.actions.pipe(
    ofType(getAdditionalList),
    switchMap(() => effectRequest(
      this.additionalService.getAdditionalList()
        .pipe(map((value) => additionalSuccess({ data: { kind: 'list', value } }))),
      action => action,
      additionalFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getAdditional),
    switchMap(({ id }) => effectRequest(
      this.additionalService.getAdditional(id).pipe(map((selected?: IAdditional) => additionalSelected({ selected }))),
      action => action,
      additionalFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createAdditional),
    switchMap(({ additional }) => effectRequest(
      this.additionalService.createAdditional(additional).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('ADDITIONAL.CREATED', { name: response.name });
        const path = `additional/${ response.id }`;
        return successResponse(additionalSaveSuccess, message, path, 'additional');
      })),
      action => action,
      additionalFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateAdditional),
    switchMap(({ id, additional }) => effectRequest(
      this.additionalService.updateAdditional(id, additional).pipe(switchMap((response: IAdditional) => {
        const message = this.translate.instant('ADDITIONAL.UPDATED.MESSAGE', { name: response.name });
        const path = `additional/${ response.id }`;
        return successResponse(additionalSaveSuccess, message, path, 'additional');
      })),
      action => action,
      additionalFailure,
    )),
  ));

  updateSort$ = createEffect(() => this.actions.pipe(
    ofType(sortAdditional),
    switchMap(({ additionalList }) => effectRequest(
      this.additionalService.sortAdditional(additionalList).pipe(switchMap(() => success(additionalSaveSuccess, 'ADDITIONAL.SORTED.MESSAGE'))),
      action => action,
      additionalFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteAdditional),
    switchMap(({ id, name }) => effectRequest(
      this.additionalService.deleteAdditional(id).pipe(switchMap(() => {
        const message = this.translate.instant('ADDITIONAL.DELETED.MESSAGE', { name });
        return success(additionalSaveSuccess, message, undefined, true, 'warning');
      })),
      action => action,
      additionalFailure,
    )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsGroup),
    switchMap(() => effectRequest(
      this.treatmentService.getAllTreatmentsGroup().pipe(map((groups) => findGroupsSuccess({ groups }))),
      action => action,
      additionalFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(additionalSelected),
    tap(({ selected }) => this.router.navigate(
      [this.translate.getCurrentLang(), 'additional', selected?.id])),
  ), { dispatch: false });
}
