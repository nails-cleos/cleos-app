import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
import {
  colorSuccess,
  createTreatment,
  deleteTreatmentGroup,
  getAllColors,
  getAllTreatmentsGroup,
  getAllTreatmentsHistory,
  getTreatmentGroup,
  getTreatmentsPage,
  sortGroupTreatment,
  sortTreatment,
  treatmentFailure,
  treatmentHistorySuccess,
  treatmentSaveSuccess,
  treatmentSelected,
  treatmentSuccess,
  updateTreatmentGroup,
} from '../treatment.actions';
import { TranslateService } from '@ngx-translate/core';
import { TreatmentService } from '../../services/treatment.service';
import { Router } from '@angular/router';
import { ColorService } from '../../services/color.service';
import { Pagination } from '../../interfaces/pagination';
import { ITreatmentAll, ITreatmentGroupAll } from '../../interfaces/treatment';
import { IColorAll } from '../../interfaces/color';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class TreatmentEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly treatmentService: TreatmentService = inject(TreatmentService);
  private readonly colorService: ColorService = inject(ColorService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getTreatmentsPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.treatmentService.getTreatmentsPage(page, sort, direction, size).pipe(
        map((value: Pagination<ITreatmentGroupAll>) => treatmentSuccess({ data: { kind: 'pagination', value } }))),
      action => action,
      treatmentFailure,
    )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsGroup),
    switchMap(() => effectRequest(
      this.treatmentService.getAllTreatmentsGroup()
        .pipe(map((value: ITreatmentGroupAll[]) => treatmentSuccess({ data: { kind: 'list', value } }))),
      action => action,
      treatmentFailure,
    )),
  ));

  findColors$ = createEffect(() => this.actions.pipe(
    ofType(getAllColors),
    switchMap(() => effectRequest(
      this.colorService.getAllColors().pipe(map((colors: IColorAll[]) =>
        colorSuccess(colors ? { colors } : { colors: [] }))),
      action => action,
      treatmentFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getTreatmentGroup),
    switchMap(({ id, path }) => effectRequest(
      this.treatmentService.getTreatmentGroup(id).pipe(map((selected?: ITreatmentGroupAll) =>
        treatmentSelected({ selected, path }))),
      action => action,
      treatmentFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createTreatment),
    switchMap(({ treatmentGroup }) => effectRequest(
      this.treatmentService.createTreatment(treatmentGroup).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('TREATMENT.CREATED', { name: response.name });
        const path = `treatments/${ response.id }/view`;
        return successResponse(treatmentSaveSuccess, message, path, 'treatments');
      })),
      action => action,
      treatmentFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateTreatmentGroup),
    switchMap(({ id, treatmentGroup }) => effectRequest(
      this.treatmentService.updateTreatmentGroup(id, treatmentGroup).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('TREATMENT.UPDATED.MESSAGE', { name: response.name });
        const path = `treatments/${ response.id }/view`;
        return successResponse(treatmentSaveSuccess, message, path, 'treatments');
      })),
      action => action,
      treatmentFailure,
    )),
  ));

  updateSort$ = createEffect(() => this.actions.pipe(
    ofType(sortTreatment),
    switchMap(({ treatments }) => effectRequest(
      this.treatmentService.sortTreatment(treatments).pipe(switchMap(() =>
        success(treatmentSaveSuccess, 'TREATMENT.SORTED.MESSAGE'))),
      action => action,
      treatmentFailure,
    )),
  ));

  updateGroupSort$ = createEffect(() => this.actions.pipe(
    ofType(sortGroupTreatment),
    switchMap(({ groups }) => effectRequest(
      this.treatmentService.sortGroupTreatment(groups).pipe(switchMap(() =>
        success(treatmentSaveSuccess, 'TREATMENT.SORTED.MESSAGE'))),
      action => action,
      treatmentFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteTreatmentGroup),
    switchMap(({ id, name }) => effectRequest(
      this.treatmentService.deleteTreatmentGroup(id).pipe(switchMap(() => {
        const message = this.translate.instant('TREATMENT.DELETED.MESSAGE', { name });
        return success(treatmentSaveSuccess, message, undefined, true, 'warning');
      })),
      action => action,
      treatmentFailure,
    )),
  ));

  history$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsHistory),
    switchMap(({ id, treatmentId }) => effectRequest(
      this.treatmentService.getAllTreatmentsHistory(id, treatmentId).pipe(map((history: ITreatmentAll[]) =>
        treatmentHistorySuccess({ history }))),
      action => action,
      treatmentFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(treatmentSelected),
    tap(({ selected, path }) => this.router.navigate(
      [this.translate.getCurrentLang(), 'treatments', selected?.id, path])),
  ), { dispatch: false });
}
