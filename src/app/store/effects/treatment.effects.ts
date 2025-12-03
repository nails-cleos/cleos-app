import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class TreatmentEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly treatmentService: TreatmentService = inject(TreatmentService);
  private readonly colorService: ColorService = inject(ColorService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getTreatmentsPage),
    switchMap(({ page, sort, direction, size }) =>
      this.treatmentService.getTreatmentsPage(page, sort, direction, size).pipe(
        map((data: Pagination<ITreatmentGroupAll>) => treatmentSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
      )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsGroup),
    switchMap(() => this.treatmentService.getAllTreatmentsGroup().pipe(
      map((data: ITreatmentGroupAll[]) => treatmentSuccess({ data })),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  findColors$ = createEffect(() => this.actions.pipe(
    ofType(getAllColors),
    switchMap(() => this.colorService.getAllColors().pipe(
      map((colors: IColorAll[]) => colorSuccess(colors ? { colors } : { colors: [] })),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getTreatmentGroup),
    switchMap(({ id, path }) => this.treatmentService.getTreatmentGroup(id).pipe(
      map((selected?: ITreatmentGroupAll) => treatmentSelected({ selected, path })),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createTreatment),
    switchMap(({ treatmentGroup }) => this.treatmentService.createTreatment(treatmentGroup).pipe(
      switchMap((response: IApiResponse) => this.requestSuccess('TREATMENT.CREATED', response.name, response.id)),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateTreatmentGroup),
    switchMap(({ id, treatmentGroup }) => this.treatmentService.updateTreatmentGroup(id, treatmentGroup).pipe(
      switchMap((response: IApiResponse) =>
        this.requestSuccess('TREATMENT.UPDATED.MESSAGE', response.name, response.id)),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  updateSort$ = createEffect(() => this.actions.pipe(
    ofType(sortTreatment),
    switchMap(({ treatments }) => this.treatmentService.sortTreatment(treatments).pipe(
      switchMap(() => this.requestSuccess('TREATMENT.SORTED.MESSAGE')),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  updateGroupSort$ = createEffect(() => this.actions.pipe(
    ofType(sortGroupTreatment),
    switchMap(({ groups }) => this.treatmentService.sortGroupTreatment(groups).pipe(
      switchMap(() => this.requestSuccess('TREATMENT.SORTED.MESSAGE')),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteTreatmentGroup),
    switchMap(({ id, name }) => this.treatmentService.deleteTreatmentGroup(id).pipe(
      switchMap(() => this.requestSuccess('TREATMENT.DELETED.MESSAGE', name, undefined, 'warning')),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  history$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsHistory),
    switchMap(({ id, treatmentId }) => this.treatmentService.getAllTreatmentsHistory(id, treatmentId).pipe(
      map((history: ITreatmentAll[]) => treatmentHistorySuccess({ history })),
      catchError((err: HttpErrorResponse) => of(treatmentFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(treatmentSelected),
    tap(({ selected, path }) => this.router.navigate(
      [this.translate.currentLang, 'treatments', selected?.id, path])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(treatmentSuccess),
  ), { dispatch: false });

  colorsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(colorSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(treatmentSaveSuccess),
  ), { dispatch: false });

  historySuccess$ = createEffect(() => this.actions.pipe(
    ofType(treatmentHistorySuccess),
  ), { dispatch: false });

  private requestSuccess(key: string, name?: string, id?: string, toastType?: ToastType) {
    const message = this.translate.instant(key, { name });
    const path = id ? `treatments/${id}/view` : undefined;
    return success(treatmentSaveSuccess, message, path, undefined, toastType);
  }
}
